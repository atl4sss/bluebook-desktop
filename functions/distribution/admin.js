// Administrator workstation only. Uses Application Default Credentials, never client credentials.
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { newGrant } = require('./access');

async function main() {
  const [command, target, filename, hours = '24'] = process.argv.slice(2);
  if (!['issue', 'revoke'].includes(command)) {
    throw new Error('Usage: node distribution/admin.js issue installers/file.exe Bluebook.exe [hours] | revoke GRANT_ID');
  }
  initializeApp();
  const db = getFirestore();
  if (command === 'revoke') {
    if (!/^[a-f0-9]{64}$/.test(target || '')) throw new Error('Invalid grant ID');
    await db.collection('downloadGrants').doc(target).update({ state: 'revoked', revokedAt: Date.now() });
    console.log('Link revoked. An already running transfer cannot be recalled.');
    return;
  }
  const origin = process.env.DOWNLOAD_ORIGIN;
  if (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://') || !process.env.DOWNLOAD_BUCKET) {
    throw new Error('Set DOWNLOAD_ORIGIN and DOWNLOAD_BUCKET.');
  }
  const file = getStorage().bucket(process.env.DOWNLOAD_BUCKET).file(target || '');
  const [metadata] = await file.getMetadata();
  if (metadata.metadata?.firebaseStorageDownloadTokens) {
    throw new Error('Remove Firebase download tokens from this private object before issuing a link.');
  }
  const grant = newGrant({ object: target, generation: String(metadata.generation), filename,
    expiresAt: Date.now() + Number(hours) * 3600000 });
  await db.collection('downloadGrants').doc(grant.id).create(grant.record);
  console.log(JSON.stringify({ grantId: grant.id, url: `${origin}/#${grant.token}`, expiresAt: grant.record.expiresAt }, null, 2));
}
main().catch(() => {
  console.error('Operation failed. Check arguments, ADC permissions, bucket privacy, and configuration.');
  process.exitCode = 1;
});
