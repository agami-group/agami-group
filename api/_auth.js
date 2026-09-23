import { timingSafeEqual, createHash } from 'node:crypto';

// Compares the password sent by the admin page with the ADMIN_PASSWORD environment variable.
export function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const given = String(req.headers['x-admin-password'] || '');
  if (!expected || !given) return false;
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
