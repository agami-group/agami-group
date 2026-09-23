// Admin API (password protected with the ADMIN_PASSWORD environment variable)
//   GET  /api/admin  -> current content, without any cache (also used to check the password)
//   POST /api/admin  -> save new content  { text: {...}, team: [...] }
import { isAdmin } from './_auth.js';
import { readContent, writeContent, sanitize } from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in Vercel → Settings → Environment Variables.' });
  if (!isAdmin(req)) {
    await new Promise(r => setTimeout(r, 600)); // slow down guessing
    return res.status(401).json({ error: 'Wrong password' });
  }

  if (req.method === 'GET') return res.status(200).json(await readContent());

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body) return res.status(400).json({ error: 'Invalid data' });
    const clean = sanitize(body);
    try {
      await writeContent(clean);
    } catch (e) {
      return res.status(500).json({ error: 'Could not save. Is a Blob store connected to this project? (' + (e.message || e) + ')' });
    }
    return res.status(200).json({ ok: true, content: clean });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
