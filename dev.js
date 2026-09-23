// Local dev server: serves public/ like Vercel (clean URLs) and runs the api/ functions.
// Content is saved to .local-content.json instead of Vercel Blob.
//   npm run dev   -> http://localhost:3000   (admin password: ADMIN_PASSWORD, default "admin")
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

process.env.LOCAL_DEV = '1';
process.env.ADMIN_PASSWORD ||= 'admin';
const PORT = Number(process.env.PORT) || 3000;
const ROOT = join(import.meta.dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

async function findFile(urlPath) {
  const base = join(ROOT, normalize(decodeURIComponent(urlPath)));
  if (!base.startsWith(ROOT)) return null;
  for (const p of [base, base + '.html', join(base, 'index.html')]) {
    try { if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
}

async function runApi(name, req, res) {
  let mod;
  try { mod = await import(`./api/${name}.js?t=${Date.now()}`); } catch { return false; }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { req.body = raw && req.headers['content-type']?.includes('json') ? JSON.parse(raw) : raw; } catch { req.body = raw; }
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
  await mod.default(req, res);
  return true;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    const api = pathname.match(/^\/api\/([a-z][\w-]*)\/?$/);
    if (api && await runApi(api[1], req, res)) return;
    const file = await findFile(pathname);
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500);
    res.end('Server error');
  } finally {
    console.log(req.method, pathname, res.statusCode);
  }
}).listen(PORT, () => console.log(`Agami site on http://localhost:${PORT}  (admin: /admin, password "${process.env.ADMIN_PASSWORD}")`));
