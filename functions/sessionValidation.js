function validateSessionInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid input");
  if (
    Object.keys(data).sort().join(",") !== "appVersion,code,platform,requestId"
  )
    throw new Error("Unexpected fields");
  if (typeof data.code !== "string") throw new Error("Invalid code");
  const code = data.code.normalize("NFKC").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) throw new Error("Invalid code");
  if (
    typeof data.requestId !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      data.requestId,
    )
  )
    throw new Error("Invalid request ID");
  if (!["windows", "macos", "linux", "web"].includes(data.platform))
    throw new Error("Invalid platform");
  if (
    typeof data.appVersion !== "string" ||
    !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(data.appVersion) ||
    data.appVersion.length > 40
  )
    throw new Error("Invalid version");
  return {
    code,
    requestId: data.requestId,
    platform: data.platform,
    appVersion: data.appVersion,
  };
}
module.exports = { validateSessionInput };
