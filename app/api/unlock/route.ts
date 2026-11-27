import { NextResponse } from 'next/server';
import { COOKIE, checkPassword, token } from '@/lib/nda';

export async function POST(req: Request) {
  let password = '';
  try { ({ password = '' } = await req.json()); } catch {}
  const t = token();
  if (!t) return NextResponse.json({ ok: false, error: 'CASE_PASSWORD is not set' }, { status: 500 });
  if (!checkPassword(String(password))) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
