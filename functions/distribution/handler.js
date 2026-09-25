const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { pipeline } = require('node:stream/promises');
const { tokenHash, available } = require('./access');
const page = readFileSync(join(__dirname, 'index.html'));
const script = readFileSync(join(__dirname, 'download.js'));

function handler({ grants, bucket, origin }) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
    const reply = (status, body) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(body);
    };
    try {
      if (req.method === 'GET' && req.url === '/') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(page);
        return;
      }
      if (req.method === 'GET' && req.url === '/download.js') {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(script);
        return;
      }
      if (req.url !== '/download') return reply(404, 'Not found');
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return reply(405, 'Use the download button.');
      }
      // A same-origin form POST is required; preview scanners only GET the page.
      if (req.headers.origin !== origin) return reply(403, 'Open the original download page.');
      if (req.headers.range) return reply(400, 'Partial downloads are not supported.');
      if (req.headers['content-type']?.split(';')[0] !== 'application/x-www-form-urlencoded') {
        return reply(415, 'Invalid request format.');
      }
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
        if (Buffer.byteLength(body) > 512) return reply(413, 'Request too large.');
      }
      const params = new URLSearchParams(body);
      if ([...params.keys()].join(',') !== 'token') return reply(400, 'Invalid request.');
      let id;
      try { id = tokenHash(params.get('token')); }
      catch { return reply(400, 'Invalid download link.'); }
      const candidate = await grants.get(id);
      if (!available(candidate)) return reply(410, 'This link is expired, revoked, or already used.');
      // Pin the issued object generation. Never redirect to a reusable storage URL.
      const file = bucket.file(candidate.object, { generation: candidate.generation });
      const [exists] = await file.exists();
      if (!exists) return reply(503, 'Installer unavailable. Contact the issuer.');
      const grant = await grants.consume(id);
      if (!grant) return reply(410, 'This link is expired, revoked, or already used.');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${grant.filename}"`);
      res.setHeader('Accept-Ranges', 'none');
      // No Content-Length: Cloud Run streams installers larger than 32 MiB.
      await pipeline(file.createReadStream(), res);
    } catch {
      // Never log bearer tokens, request bodies, or storage errors with URLs.
      if (!res.headersSent && !res.destroyed) reply(503, 'Download failed. Contact the issuer for a replacement link.');
      else res.destroy();
    }
  };
}
module.exports = { handler };
