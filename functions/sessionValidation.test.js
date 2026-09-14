const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateSessionInput } = require("./sessionValidation");
const valid = {
  code: "001234",
  requestId: "d956054d-2bfe-4eef-a393-403ee3f0eb2e",
  platform: "macos",
  appVersion: "0.1.0",
};
test("accepts normalized digits without dropping leading zeros", () =>
  assert.equal(
    validateSessionInput({ ...valid, code: " ００１２３４ " }).code,
    "001234",
  ));
test("rejects malformed data and extra personal data fields", () => {
  for (const data of [
    null,
    {},
    { ...valid, code: 123456 },
    { ...valid, code: "abc123" },
    { ...valid, code: "1234567" },
    { ...valid, requestId: "../other" },
    { ...valid, platform: "arbitrary" },
    { ...valid, appVersion: "bad" },
    { ...valid, name: "unnecessary" },
  ])
    assert.throws(() => validateSessionInput(data));
});
