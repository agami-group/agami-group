// GET /api/content  -> the saved text + team (public, read-only)
import { readContent } from './_store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const content = await readContent();
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
  return res.status(200).json(content);
}
