import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  doc: vi.fn((_firestore, collection: string, id: string) => ({
    collection,
    id,
  })),
  serverTimestamp: vi.fn(() => ({ serverTimestamp: true })),
  setDoc: vi.fn(),
}));

vi.mock("../src/services/firebase", () => ({
  getFirebase: () => ({ firestore: {} }),
}));
vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
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
      expect.stringMatching(/^Arina_Masalskaia__001234__\d+$/),
    );
    expect(mocks.setDoc).toHaveBeenCalledWith(expect.anything(), {
      name: "Arina Masalskaia",
      code: "001234",
      createdAt: { serverTimestamp: true },
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
