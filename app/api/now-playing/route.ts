// What I'm listening to on Spotify, for the footer. Needs three settings (see README):
// SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN. Without them it reports nothing playing.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
type Track = { name: string; artists: { name: string }[]; external_urls?: { spotify?: string } };
const shape = (t: Track, playing: boolean) => ({ playing, title: t.name, artist: t.artists.map((a) => a.name).join(', '), url: t.external_urls?.spotify ?? null });

export async function GET() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  const none = (configured: boolean) => NextResponse.json({ configured, playing: false }, { headers: { 'cache-control': 'public, s-maxage=30, stale-while-revalidate=30' } });
  if (!id || !secret || !refresh) return none(false);
  try {
    const tok = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }), cache: 'no-store',
    }).then((r) => r.json());
    const h = { authorization: `Bearer ${tok.access_token}` };
    const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: h, cache: 'no-store' });
    let body = null;
    if (now.status === 200) { const j = await now.json(); if (j?.item && j.currently_playing_type === 'track') body = shape(j.item, !!j.is_playing); }
    if (!body) {   // nothing on right now: the last thing played
      const last = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: h, cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
      if (last?.items?.[0]?.track) body = shape(last.items[0].track, false);
    }
    if (!body) return none(true);
    return NextResponse.json({ configured: true, ...body }, { headers: { 'cache-control': 'public, s-maxage=30, stale-while-revalidate=30' } });
  } catch { return none(true); }
}
