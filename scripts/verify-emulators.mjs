import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously, signOut } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, terminate } from 'firebase/firestore';

// Isolated demo project: never uses production credentials or endpoints.
const app = initializeApp({ projectId: 'demo-sat-practice', apiKey: 'demo-key', appId: 'demo-app' });
const auth = getAuth(app); connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const functions = getFunctions(app); connectFunctionsEmulator(functions, '127.0.0.1', 5001);
const db = getFirestore(app); connectFirestoreEmulator(db, '127.0.0.1', 8080);
const direct = process.argv.includes('--direct-handler');
const handler = direct ? createRequire(import.meta.url)('../functions/index.js').createSession : null;
const create = direct ? async data => ({ data: await handler.run({ data, auth: auth.currentUser ? { uid: auth.currentUser.uid, token: {} } : undefined }) }) : httpsCallable(functions, 'createSession', { timeout: 15000 });
const errorCode = code => direct ? code : `functions/${code}`;
try {
  const input = { code: '００１２３４', requestId: randomUUID(), platform: 'windows', appVersion: '0.1.0' };
  await assert.rejects(create(input), { code: errorCode('unauthenticated') });
  const { user } = await signInAnonymously(auth);
  await assert.rejects(create({ ...input, name: 'not allowed' }), { code: errorCode('invalid-argument') });
  const { data } = await create(input);
  assert.equal(data.sessionId, `${user.uid}_${input.requestId}`);
  const again = await create(input);
  assert.equal(again.data.sessionId, data.sessionId);
  await assert.rejects(create({ ...input, code: '999999' }), { code: errorCode('already-exists') });
  await assert.rejects(getDoc(doc(db, 'sessions', data.sessionId)), { code: 'permission-denied' });
  await assert.rejects(setDoc(doc(db, 'sessions', 'forged'), { code: '999999' }), { code: 'permission-denied' });
  const adminRead = await fetch(`http://127.0.0.1:8080/v1/projects/demo-sat-practice/databases/(default)/documents/sessions/${data.sessionId}`, { headers: { Authorization: 'Bearer owner' } });
  assert.equal(adminRead.status, 200);
  const saved = await adminRead.json();
  assert.equal(saved.fields.code.stringValue, '001234');
  assert.equal(saved.fields.ownerId.stringValue, user.uid);
  assert.ok(Date.parse(saved.fields.createdAt.timestampValue));
  assert.deepEqual(Object.keys(saved.fields).sort(), ['appVersion', 'code', 'createdAt', 'ownerId', 'platform']);
  console.log(direct ? 'Direct handler + real Auth/Firestore emulators (callable transport not exercised).' : 'Full callable transport.');
  console.log('PASS: authentication, validation, session creation, idempotent retry, server timestamp, minimum fields, denied client reads/writes.');
} finally {
  await signOut(auth); await terminate(db); await deleteApp(app);
}
