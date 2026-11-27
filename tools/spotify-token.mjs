#!/usr/bin/env node
// Gets the Spotify refresh token the footer needs. Run it on your own computer:
//
//   node tools/spotify-token.mjs        (or: npm run spotify-token)
//
// It asks for your app's Client ID and Client Secret, opens Spotify's approval page in your browser,
// catches the reply on http://127.0.0.1:3000/callback, and prints the refresh token.
// Nothing is saved or sent anywhere except to Spotify.
//
// Before you run it, in your app at developer.spotify.com/dashboard:
//   - add http://127.0.0.1:3000/callback under Redirect URIs (exactly that), and save;
//   - be signed in with a Premium account (Spotify requires Premium for Development Mode apps).
// Use --port 8888 if something else is using port 3000 (then add that redirect URI instead).
import http from 'node:http';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { exec } from 'node:child_process';

const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 3000;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = 'user-read-currently-playing user-read-recently-played';

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); else rl.output.write('*'.repeat(s.length ? 1 : 0)); };
    }
    rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(answer.trim()); });
  });
}

function openInBrowser(url) {
  const cmd = process.platform === 'darwin' ? `open "${url}"` : process.platform === 'win32' ? `start "" "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

const page = (title, body) => `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font:16px/1.5 system-ui;max-width:32em;margin:15vh auto;padding:0 1em"><h1 style="font-size:20px">${title}</h1><p>${body}</p></body>`;

const id = process.env.SPOTIFY_CLIENT_ID || (await ask('Client ID: '));
const secret = process.env.SPOTIFY_CLIENT_SECRET || (await ask('Client Secret (hidden): ', true));
if (!id || !secret) { console.error('\nBoth the Client ID and the Client Secret are needed. Find them in your app at developer.spotify.com/dashboard.'); process.exit(1); }

const state = crypto.randomBytes(12).toString('hex');
const authorize = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({ client_id: id, response_type: 'code', redirect_uri: REDIRECT, scope: SCOPES, state, show_dialog: 'true' });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
  const done = (code, title, body) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8' }).end(page(title, body)); };

  if (url.searchParams.get('state') !== state) return done(400, 'That reply didn’t match', 'Go back to the terminal and run the script again.');
  const err = url.searchParams.get('error');
  if (err) { done(400, 'Spotify said no', `Spotify returned “${err}”. Check the terminal.`); console.error(`\nSpotify returned "${err}". If you pressed Cancel, run it again and press Agree.`); return finish(1); }

  try {
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: REDIRECT }),
    });
    const tok = await r.json();
    if (!r.ok || !tok.refresh_token) {
      done(500, 'Couldn’t get the token', 'Check the terminal.');
      console.error('\nSpotify refused the token request:', tok.error_description || tok.error || r.status);
      if (tok.error === 'invalid_client') console.error('The Client ID or Client Secret is wrong. Copy them again from the dashboard.');
      return finish(1);
    }

    // check it works: what's playing, or the last thing played
    const h = { authorization: `Bearer ${tok.access_token}` };
    let check = '';
    const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: h });
    if (now.status === 200) { const j = await now.json(); if (j?.item) check = `Playing now: ${j.item.name} — ${j.item.artists.map((a) => a.name).join(', ')}`; }
    if (!check) {
      const last = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: h });
      if (last.ok) { const j = await last.json(); const t = j.items?.[0]?.track; check = t ? `Last played: ${t.name} — ${t.artists.map((a) => a.name).join(', ')}` : 'Connected (nothing played recently).'; }
      else check = `Connected, but Spotify answered ${last.status} when asked what you've played. If it's 403, make sure the account you approved with has Premium and is the app's owner or listed under User Management.`;
    }

    done(200, 'Done', 'You can close this tab and go back to the terminal.');
    console.log(`\n${check}\n`);
    console.log('Add these three in Vercel → your project → Settings → Environment Variables (all environments), then redeploy:\n');
    console.log(`  SPOTIFY_CLIENT_ID      ${id}`);
    console.log('  SPOTIFY_CLIENT_SECRET  (the secret you just typed)');
    console.log(`  SPOTIFY_REFRESH_TOKEN  ${tok.refresh_token}\n`);
    console.log('Keep the refresh token private: it lets anyone read what you listen to.');
    finish(0);
  } catch (e) {
    done(500, 'Something went wrong', 'Check the terminal.');
    console.error('\nCouldn’t reach Spotify:', e.message);
    finish(1);
  }
});

function finish(code) { setTimeout(() => { server.close(); process.exit(code); }, 300); }

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`\nPort ${PORT} is busy (is the site running locally?). Stop it, or run with --port 8888 and add http://127.0.0.1:8888/callback as a redirect URI.`);
  else console.error(e.message);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nOpening Spotify in your browser. If nothing opens, paste this link into your browser:\n\n${authorize}\n\nPress Agree, then come back here.`);
  openInBrowser(authorize);
});
