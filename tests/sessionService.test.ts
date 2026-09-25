import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  doc: vi.fn((_firestore, collection: string, id: string) => ({
    collection,
    id,
  })),
  serverTimestamp: vi.fn(() => ({ serverTimestamp: true })),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getDocFromServer: vi.fn(),
}));

vi.mock("../src/services/firebase", () => ({
  getFirebase: () => ({ firestore: {} }),
}));
vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
  onSnapshot: mocks.onSnapshot,
  getDocFromServer: mocks.getDocFromServer,
}));

import { createSession, validateName } from "../src/services/sessionService";

beforeEach(() => vi.clearAllMocks());

describe("Direct Firestore session service", () => {
  it("writes the normalized name and code to enteredCodes", async () => {
    mocks.setDoc.mockResolvedValueOnce(undefined);
    const result = await createSession(
      " ００１２３４ ",
      "  Arina   Masalskaia  ",
    );
    expect(result.name).toBe("Arina Masalskaia");
    expect(mocks.doc).toHaveBeenCalledWith(
      {},
      "enteredCodes",
      expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
    );
    expect(mocks.setDoc).toHaveBeenCalledWith(expect.anything(), {
      name: "Готов: Arina Masalskaia",
      code: "001234",
      createdAt: { serverTimestamp: true },
      approved: false,
    });
  });

  it("shares one in-flight write between repeated submissions", async () => {
    let finish!: () => void;
    mocks.setDoc.mockReturnValueOnce(
      new Promise<void>((resolve) => (finish = resolve)),
    );
    const first = createSession("654321", "Student");
    const second = createSession("654321", "Student");
    expect(second).toBe(first);
    finish();
    await expect(first).resolves.toMatchObject({ name: "Student" });
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
  });

  it("requires a non-empty name", () => {
    expect(() => validateName("   ")).toThrow("Enter your name");
  });
});

it("retries the same entry after failure and keeps readiness names within the rules limit", async () => {
  mocks.setDoc
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(undefined);
  await expect(createSession("333333", "A".repeat(80))).rejects.toThrow(
    "offline",
  );
  const failedId = mocks.doc.mock.calls[0][2];
  await createSession("333333", "A".repeat(80));
  expect(mocks.doc.mock.calls[1][2]).toBe(failedId);
  expect(mocks.setDoc.mock.calls[1][1].name).toHaveLength(80);
});
