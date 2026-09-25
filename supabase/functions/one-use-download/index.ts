// No client key is embedded: the service role remains in the Edge Function runtime.
const bucket = 'installer-downloads';
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Download Bluebook</title></head><body><main><h1>Download Bluebook</h1><p>This link works for one download. Check your internet connection before continuing.</p><form method="post"><input type="hidden" name="token" id="token"><button id="download" disabled>Download for Windows</button></form><p id="status" role="status">Open your personal link to continue.</p></main><script>
const token=location.hash.slice(1);history.replaceState(null,'',location.pathname);
if(/^[A-Za-z0-9_-]{43}$/.test(token)){document.getElementById('token').value=token;document.getElementById('download').disabled=false;document.getElementById('status').textContent='Ready to download.'}
document.querySelector('form').addEventListener('submit',()=>{document.getElementById('download').disabled=true;document.getElementById('status').textContent='Download requested. This link cannot be used again.'});
</script></body></html>`;

function reply(message: string, status: number): Response {
  return new Response(message, { status, headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET') return new Response(html, { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  } });
  if (req.method !== 'POST') return reply('Method not allowed.', 405);
  if (req.headers.get('origin') !== url.origin) return reply('Open your personal download page.', 403);
  if (req.headers.has('range')) return reply('Partial downloads are not supported.', 400);
  if (req.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded') return reply('Invalid request.', 415);
  if (Number(req.headers.get('content-length') || 0) > 512) return reply('Request too large.', 413);
  const body = await req.text();
  if (body.length > 512) return reply('Request too large.', 413);
  const fields = new URLSearchParams(body);
  const token = fields.get('token');
  if (fields.size !== 1 || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return reply('Invalid link.', 400);
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const base = Deno.env.get('SUPABASE_URL');
  if (!serviceRole || !base) return reply('Download service is unavailable.', 503);
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hash = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
    // This RPC atomically claims one download. Never hand out a signed URL.
    const claimed = await fetch(`${base}/rest/v1/rpc/consume_installer_grant`, {
      method: 'POST', headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_hash: hash }),
    });
    if (!claimed.ok) return reply('Download service is unavailable.', 503);
    const grants = await claimed.json();
    if (!Array.isArray(grants) || grants.length !== 1) return reply('This link has expired or was already used.', 410);
    const { object_path, filename } = grants[0];
    if (typeof object_path !== 'string' || !/^installers\/[a-zA-Z0-9_.-]+$/.test(object_path) ||
        typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$/.test(filename)) {
      return reply('Installer unavailable. Request another link.', 503);
    }
    const file = await fetch(`${base}/storage/v1/object/authenticated/${bucket}/${object_path}`, {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    });
    if (!file.ok || !file.body) return reply('Installer unavailable. Request another link.', 503);
    // Copy only the file stream. Never forward authentication or caching headers.
    return new Response(file.body, { headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Accept-Ranges': 'none',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return reply('Download failed. Request another link.', 503);
  }
});
