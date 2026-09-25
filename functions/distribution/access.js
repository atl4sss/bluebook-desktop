const { createHash, randomBytes } = require('node:crypto');

function tokenHash(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new Error('Invalid download token');
  }
  return createHash('sha256').update(token).digest('hex');
}

function newGrant({ object, generation, filename, expiresAt }, now = Date.now()) {
  if (typeof object !== 'string' || !object.startsWith('installers/') || object.includes('..') ||
      typeof generation !== 'string' || !/^\d+$/.test(generation) ||
      typeof filename !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}$/.test(filename) ||
      !Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + 7 * 86400000) {
    throw new Error('Invalid installer or expiration (maximum 7 days)');
  }
  const token = randomBytes(32).toString('base64url');
  return { token, id: tokenHash(token), record: {
    object, generation, filename, expiresAt, createdAt: now, state: 'issued',
  } };
}

function available(record, now = Date.now()) {
  return !!record && record.state === 'issued' &&
    Number.isSafeInteger(record.expiresAt) && record.expiresAt > now;
}

function grantStore(db) {
  const collection = db.collection('downloadGrants');
  return {
    async get(id) { return (await collection.doc(id).get()).data(); },
    async consume(id) {
      return db.runTransaction(async (tx) => {
        const ref = collection.doc(id);
        const record = (await tx.get(ref)).data();
        const now = Date.now();
        if (!available(record, now)) return null;
        tx.update(ref, { state: 'consumed', consumedAt: now });
        return record;
      });
    },
  };
}
module.exports = { tokenHash, newGrant, available, grantStore };
