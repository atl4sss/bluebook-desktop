const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { Readable } = require('node:stream');
const { newGrant, tokenHash, available, grantStore } = require('./access');
const { handler } = require('./handler');

const settings = () => ({ object: 'installers/app.exe', generation: '123', filename: 'Bluebook.exe', expiresAt: Date.now() + 60000 });
test('256-bit secrets are hashed; expired and terminal grants are denied', () => {
  const grant = newGrant(settings());
  assert.equal(grant.token.length, 43);
  assert.equal(tokenHash(grant.token), grant.id);
  assert.equal(JSON.stringify(grant.record).includes(grant.token), false);
  assert.equal(available(grant.record), true);
  for (const state of ['consumed', 'revoked', 'unknown']) assert.equal(available({ ...grant.record, state }), false);
  assert.equal(available(grant.record, grant.record.expiresAt), false);
  assert.throws(() => tokenHash('../invalid'));
  assert.throws(() => newGrant({ ...settings(), filename: 'evil\r\nHeader.exe' }));
  assert.throws(() => newGrant({ ...settings(), expiresAt: Date.now() + 8 * 86400000 }));
});

test('store consumes only inside transaction and does not revive consumed/revoked grants', async () => {
  let record = newGrant(settings()).record;
  const ref = {};
  const db = { collection: () => ({ doc: () => ref }), runTransaction: async (fn) => fn({
    get: async (r) => { assert.equal(r, ref); return { data: () => record }; },
    update: (r, patch) => { assert.equal(r, ref); record = { ...record, ...patch }; },
  }) };
  const store = grantStore(db);
  assert.equal((await store.consume('id')).state, 'issued');
  assert.equal(record.state, 'consumed');
  assert.equal(await store.consume('id'), null);
  record.state = 'revoked';
  assert.equal(await store.consume('id'), null);
});

async function fixture(t, { state = 'issued', exists = true, expiresAt, failStream = false } = {}) {
  const grant = newGrant(settings());
  let record = { ...grant.record, state, ...(expiresAt ? { expiresAt } : {}) };
  let reads = 0;
  const grants = {
    get: async (id) => id === grant.id ? record : undefined,
    consume: async (id) => {
      if (id !== grant.id || !available(record)) return null;
      const old = record;
      record = { ...record, state: 'consumed' };
      return old;
    },
  };
  const server = createServer(handler({ grants, origin: 'https://download.example', bucket: {
    file: (object, options) => {
      assert.equal(object, grant.record.object);
      assert.equal(options.generation, '123');
      return { exists: async () => [exists], createReadStream: () => {
        reads++;
        if (failStream) return new Readable({ read() { this.destroy(new Error('failure')); } });
        return Readable.from(['installer-bytes']);
      } };
    },
  } }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (extra = {}) => fetch(`${base}/download`, {
    method: 'POST', headers: { Origin: 'https://download.example', 'Content-Type': 'application/x-www-form-urlencoded', ...extra },
    body: new URLSearchParams({ token: grant.token }),
  });
  return { base, post, state: () => record.state, reads: () => reads };
}

test('page preview and GET do not consume; simultaneous POSTs stream exactly once', async (t) => {
  const f = await fixture(t);
  assert.equal((await fetch(f.base)).status, 200);
  assert.equal((await fetch(`${f.base}/download`)).status, 405);
  assert.equal(f.state(), 'issued');
  const responses = await Promise.all([f.post(), f.post(), f.post()]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 410, 410]);
  const success = responses.find((r) => r.status === 200);
  assert.equal(await success.text(), 'installer-bytes');
  assert.equal(success.headers.get('cache-control'), 'no-store');
  assert.equal(success.headers.get('location'), null);
  assert.equal(f.reads(), 1);
  assert.equal((await f.post()).status, 410);
});

test('cross-origin and range requests cannot consume a grant', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.post({ Origin: 'https://other.example' })).status, 403);
  assert.equal((await f.post({ Range: 'bytes=0-10' })).status, 400);
  assert.equal(f.state(), 'issued');
});

test('missing installer preserves grant; expired and revoked grants cannot download', async (t) => {
  const missing = await fixture(t, { exists: false });
  assert.equal((await missing.post()).status, 503);
  assert.equal(missing.state(), 'issued');
  for (const config of [{ state: 'revoked' }, { expiresAt: 1 }]) {
    const f = await fixture(t, config);
    assert.equal((await f.post()).status, 410);
    assert.equal(f.reads(), 0);
  }
});

test('stream failure cannot reopen the download grant', async (t) => {
  const f = await fixture(t, { failStream: true });
  await assert.rejects(async () => { const response = await f.post(); await response.text(); });
  assert.equal(f.state(), 'consumed');
  assert.equal((await f.post()).status, 410);
});
