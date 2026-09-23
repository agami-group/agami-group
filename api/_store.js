// Shared helpers: content is stored as one private JSON file in Vercel Blob.
import { get, put } from '@vercel/blob';
import { readFile, writeFile } from 'node:fs/promises';

const PATH = 'site/content.json';
export const EMPTY = { text: {}, team: [] };

// When running locally (npm run dev), content lives in .local-content.json instead of Blob.
const LOCAL_FILE = new URL('../.local-content.json', import.meta.url);

export async function readContent() {
  if (process.env.LOCAL_DEV) {
    try { return JSON.parse(await readFile(LOCAL_FILE, 'utf8')); } catch { return EMPTY; }
  }
  try {
    const res = await get(PATH, { access: 'private', useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return EMPTY;
    const raw = await new Response(res.stream).text();
    return JSON.parse(raw);
  } catch (e) {
    // Nothing saved yet (or store not connected) -> the site shows its built-in text.
    return EMPTY;
  }
}

export async function writeContent(content) {
  if (process.env.LOCAL_DEV) return writeFile(LOCAL_FILE, JSON.stringify(content, null, 2));
  await put(PATH, JSON.stringify(content), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

// Keep only the shape we expect, with sane size limits.
export function sanitize(input) {
  const out = { text: {}, team: [] };
  if (input && typeof input.text === 'object' && input.text) {
    for (const [k, v] of Object.entries(input.text)) {
      if (/^[a-z]+-\d{2}$/.test(k) && typeof v === 'string' && v.trim()) out.text[k] = v.slice(0, 2000);
    }
  }
  if (input && Array.isArray(input.team)) {
    out.team = input.team.slice(0, 24)
      .map(p => ({ name: String(p?.name ?? '').slice(0, 80).trim(), role: String(p?.role ?? '').slice(0, 80).trim() }))
      .filter(p => p.name);
  }
  return out;
}
