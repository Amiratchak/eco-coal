import { timingSafeEqual } from 'node:crypto';

/*
 * Simple passcode check for admin-only API routes.
 * The browser sends the passcode in the "x-admin-key" header and it is
 * compared with ADMIN_KEY from .env.local using a constant-time compare.
 */
export function isAdmin(request) {
  const expected = process.env.ADMIN_KEY;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
