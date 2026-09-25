const hash = process.argv[2];
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key || !/^[a-f0-9]{64}$/.test(hash || '')) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; pass the 64-character grant ID.');
}
const response = await fetch(`${new URL(base).origin}/rest/v1/installer_grants?token_hash=eq.${hash}&state=eq.issued`, {
  method: 'PATCH', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ state: 'revoked' }),
});
if (!response.ok) throw new Error(`Cannot revoke link (HTTP ${response.status}).`);
console.log('Link revoked if still unused.');
