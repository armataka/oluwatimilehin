import 'server-only';
import { createHash } from 'node:crypto';

export const COOKIE = 'nda';

/** What the unlock cookie holds: a hash of the password, so changing CASE_PASSWORD locks everyone out again. */
export function token() {
  const pw = process.env.CASE_PASSWORD;
  if (!pw) return process.env.NODE_ENV === 'production' ? null : 'dev';
  return createHash('sha256').update(`nda:${pw}`).digest('hex');
}

export function checkPassword(given: string) {
  const pw = process.env.CASE_PASSWORD;
  if (!pw) return process.env.NODE_ENV !== 'production' && given.length > 0; // any password works locally until one is set
  return given === pw;
}
