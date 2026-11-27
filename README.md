# oluwatimilehin.me

Portfolio of Oluwatimilehin Odunlami. Next.js (App Router) with Keystatic for editing.

## Run it

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Editor: http://localhost:3000/keystatic (edits save straight to the files in `content/`)

Locally, any password opens the locked case studies until you set `CASE_PASSWORD` in `.env.local`.

## Where things live

| What | Where |
| --- | --- |
| Name, email, links, résumé | `content/site.yaml` (Keystatic: Site details) |
| Home introduction | `content/home.yaml` (Highlights) |
| Me page, including the playbook | `content/me.yaml` (Me) |
| Kit page and credits | `content/kit.yaml` (Kit) |
| Case studies | `content/projects/*.mdoc` (Projects) |
| Screens and thumbnails | `public/images/` (uploaded through Keystatic) |
| Stickers (Me page only) | `lib/stickers.js` |
| Styles | `app/globals.css` |

In a case study, the opening paragraph and the summary are always public. If **Locked (NDA)** is ticked, everything in the body stays on the server until the visitor enters the password. Inside the body you can insert four blocks from the editor's **+** menu: **Screen** (an image or placeholder), **Steps** (the audit chain), **Figures** and **Modules**.

## Put it online

1. Import `armataka/oluwatimilehin` at vercel.com/new. Framework: Next.js, no other settings.
2. In the Vercel project, add the environment variable `CASE_PASSWORD` (the password on your résumé).
3. In Vercel → Domains, add `oluwatimilehin.me`. Vercel shows two DNS records; add them in GoDaddy → DNS (an `A` record for `@` and a `CNAME` for `www`).

## Edit on the live site

1. In Vercel, add `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` and redeploy.
2. Open `https://oluwatimilehin.me/keystatic`. Keystatic walks you through creating a GitHub app; when it finishes it gives you four values.
3. Add those four (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`) to Vercel and redeploy.

From then on, saving in `/keystatic` commits to the repo and Vercel republishes in about a minute.

## Credits

Footer after Emmanuel Hong's Hidden Footer. Name pronunciation after Earvin Fanfair. Section rail after Jesper Vos. Icons: Pixelarticons. Type: Inter, IBM Plex Mono.
