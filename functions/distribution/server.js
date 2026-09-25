const { createServer } = require('node:http');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { grantStore } = require('./access');
const { handler } = require('./handler');
const origin = process.env.DOWNLOAD_ORIGIN;
const bucketName = process.env.DOWNLOAD_BUCKET;
if (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://') || !bucketName) {
  throw new Error('Set DOWNLOAD_ORIGIN (https://host, no trailing slash) and DOWNLOAD_BUCKET.');
}
initializeApp();
const server = createServer(handler({
  grants: grantStore(getFirestore()), bucket: getStorage().bucket(bucketName), origin,
}));
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 8080), '0.0.0.0');
