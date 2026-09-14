import { getApp, getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

let client: ReturnType<typeof initializeClient> | undefined;

function initializeClient() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error(
      "Firebase is not configured. Please ask the app administrator to complete setup.",
    );
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  const firestore = getFirestore(app);
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"
  ) {
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }
  return { firestore };
}

// Lazy initialization keeps setup errors recoverable on the access-code screen.
export function getFirebase() {
  client ??= initializeClient();
  return client;
}
