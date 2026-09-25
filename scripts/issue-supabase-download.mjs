// Run only on the organizer's computer; do not embed the service role in the app.
import { createHash, randomBytes } from 'node:crypto';

const [objectPath, filename, hoursInput = '24'] = process.argv.slice(2);
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hours = Number(hoursInput);
if (!base || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(base) || !key ||
    !/^installers\/[a-zA-Z0-9_.-]+$/.test(objectPath || '') ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$/.test(filename || '') ||
    !Number.isInteger(hours) || hours < 1 || hours > 168) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Usage: node scripts/issue-supabase-download.mjs installers/Bluebook.exe Bluebook.exe [1-168 hours]');
}
const url = new URL(base);
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const existing = await fetch(`${url.origin}/storage/v1/object/authenticated/installer-downloads/${objectPath}`, {
  headers: { ...headers, Range: 'bytes=0-0' },
});
if (!existing.ok) throw new Error('Installer not found in the private installer-downloads bucket.');
await existing.body?.cancel();
const token = randomBytes(32).toString('base64url');
const token_hash = createHash('sha256').update(token).digest('hex');
const response = await fetch(`${url.origin}/rest/v1/installer_grants`, {
  method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
  body: JSON.stringify({ token_hash, object_path: objectPath, filename,
    expires_at: new Date(Date.now() + hours * 3600000).toISOString() }),
});
if (!response.ok) throw new Error(`Cannot create a link (HTTP ${response.status}). Check SQL migration and permissions.`);
console.log(`Grant ID (hash): ${token_hash}`);
console.log(`Personal link: ${url.origin}/functions/v1/one-use-download/#${token}`);
console.log(`Expires after ${hours} hour(s). The secret is displayed only once.`);
