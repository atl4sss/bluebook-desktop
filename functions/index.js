const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { validateSessionInput } = require("./sessionValidation");

initializeApp();

exports.createSession = onCall(
  { region: "us-central1", maxInstances: 10, timeoutSeconds: 15 },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "Authentication is required.");
    let input;
    try {
      input = validateSessionInput(request.data);
    } catch {
      throw new HttpsError("invalid-argument", "Invalid session information.");
    }
    const sessionId = `${request.auth.uid}_${input.requestId}`;
    const db = getFirestore();
    const ref = db.collection("sessions").doc(sessionId);
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) {
        if (existing.data().code !== input.code) {
          throw new HttpsError(
            "already-exists",
            "This request was already used.",
          );
        }
        return;
      }
      transaction.create(ref, {
        code: input.code,
        createdAt: FieldValue.serverTimestamp(),
        platform: input.platform,
        appVersion: input.appVersion,
        ownerId: request.auth.uid,
      });
    });
    return { sessionId };
  },
);
