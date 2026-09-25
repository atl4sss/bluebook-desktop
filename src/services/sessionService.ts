import {
  doc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebase } from "./firebase";

export interface Session {
  sessionId: string;
  name: string;
}

export function normalizeAccessCode(raw: string): string {
  return raw.normalize("NFKC").replace(/\s/g, "");
}

export function validateAccessCode(raw: string): string {
  const code = normalizeAccessCode(raw);
  if (!code) throw new Error("Enter your six-digit start code.");
  if (!/^\d{6}$/.test(code))
    throw new Error("The start code must contain exactly six numbers.");
  return code;
}

export function normalizeName(raw: string): string {
  return raw.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function validateName(raw: string): string {
  const name = normalizeName(raw);
  if (!name) throw new Error("Enter your name before starting the test.");
  if (name.length > 80) throw new Error("Name must be 80 characters or fewer.");
  return name;
}

let pending: Promise<Session> | undefined;
let request: { code: string; name: string; sessionId: string } | undefined;

export function createSession(
  rawCode: string,
  rawName: string,
): Promise<Session> {
  if (pending) return pending;
  const code = validateAccessCode(rawCode);
  const name = validateName(rawName);
  if (request?.code !== code || request?.name !== name) {
    request = {
      code,
      name,
      sessionId: crypto.randomUUID(),
    };
  }
  const current = request;

  pending = (async () => {
    const { firestore } = getFirebase();
    await setDoc(doc(firestore, "enteredCodes", current.sessionId), {
      name: `Готов: ${name.slice(0, 73)}`,
      code,
      createdAt: serverTimestamp(),
      approved: false,
    });
    request = undefined;
    return { sessionId: current.sessionId, name };
  })().finally(() => {
    pending = undefined;
  });
  return pending;
}

function entryRef(session: Session) {
  return doc(getFirebase().firestore, "enteredCodes", session.sessionId);
}

export function watchApproval(
  session: Session,
  onChange: (approved: boolean) => void,
  onError: () => void,
): () => void {
  return onSnapshot(
    entryRef(session),
    { includeMetadataChanges: true },
    (snapshot) => onChange(
      snapshot.exists() && !snapshot.metadata.fromCache &&
      snapshot.data().approved === true,
    ),
    onError,
  );
}

export async function checkApproval(session: Session): Promise<boolean> {
  const snapshot = await getDocFromServer(entryRef(session));
  return snapshot.exists() && snapshot.data().approved === true;
}

export function sessionErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  if (code.includes("permission-denied")) {
    return "Firestore did not allow this entry. Please check the enteredCodes security rule.";
  }
  if (code.includes("network") || code.includes("unavailable")) {
    return "We could not reach Firestore. Check your connection and try again.";
  }
  if (
    error instanceof Error &&
    error.message.startsWith("Firebase is not configured")
  )
    return error.message;
  return "We could not save your name and code. Please try again or ask for help.";
}
