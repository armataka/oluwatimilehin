// Die-cut stickers, drawn by hand. Each has a silhouette (for the white backing) and the art on top.
const D = '#1b1b19';
const font = "IBM Plex Sans, Helvetica, Arial, sans-serif";
const ball = (fill, extra, opts = {}) => `
  <circle cx="50" cy="50" r="42" fill="${fill}" stroke="${D}" stroke-width="3"/>
  ${extra}
  <path d="M84 30a42 42 0 0 1-58 58 46 46 0 0 0 58-58z" fill="#000" opacity="${opts.shade ?? 0.12}"/>
  <ellipse cx="33" cy="28" rx="13" ry="7" transform="rotate(-38 33 28)" fill="#fff" opacity="${opts.gloss ?? 0.4}"/>`;

const pent = (cx, cy, r, rot = -90) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

const soccerOuter = Array.from({ length: 5 }, (_, i) => {
  const a = ((-90 + 36 + i * 72) * Math.PI) / 180;
  const cx = 50 + 40 * Math.cos(a), cy = 50 + 40 * Math.sin(a);
  return `<polygon points="${pent(cx, cy, 12, -90 + 36 + i * 72 + 180)}" fill="${D}"/>`;
}).join('');
const soccerSpokes = Array.from({ length: 5 }, (_, i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return `<path d="M${(50 + 12 * Math.cos(a)).toFixed(1)} ${(50 + 12 * Math.sin(a)).toFixed(1)}L${(50 + 27 * Math.cos(a)).toFixed(1)} ${(50 + 27 * Math.sin(a)).toFixed(1)}" stroke="${D}" stroke-width="2.2"/>`;
}).join('');

export const stickers = [
  {
    id: 'football', label: 'Football. Not soccer.', vb: '0 0 100 100', r: 34,
    shape: '<circle cx="50" cy="50" r="42"/>',
    art: `<clipPath id="st-fb"><circle cx="50" cy="50" r="40.5"/></clipPath>
      <circle cx="50" cy="50" r="42" fill="#fff" stroke="${D}" stroke-width="3"/>
      <g clip-path="url(#st-fb)">${soccerOuter}${soccerSpokes}<polygon points="${pent(50, 50, 13)}" fill="${D}"/></g>
      <path d="M84 30a42 42 0 0 1-58 58 46 46 0 0 0 58-58z" fill="#000" opacity=".1"/>`,
  },
  {
    id: 'basketball', label: 'NBA', vb: '0 0 100 100', r: 34,
    shape: '<circle cx="50" cy="50" r="42"/>',
    art: ball('#ef7d2c', `<g fill="none" stroke="${D}" stroke-width="2.4" stroke-linecap="round"><path d="M8 50h84M50 8v84M20 20c16 14 16 46 0 60M80 20c-16 14-16 46 0 60"/></g>`),
  },
  {
    id: 'tennis', label: 'Tennis', vb: '0 0 100 100', r: 30,
    shape: '<circle cx="50" cy="50" r="42"/>',
    art: ball('#d6ec3c', `<path d="M14 26c24 12 24 36 0 48M86 26c-24 12-24 36 0 48" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>`, { gloss: 0.5 }),
  },
  {
    id: 'baseball', label: 'Shohei Ohtani', vb: '0 0 100 100', r: 30,
    shape: '<circle cx="50" cy="50" r="42"/>',
    art: ball('#fbfaf4', `<g fill="none" stroke="#cf3a2e"><path d="M27 14c14 22 14 50 0 72M73 14c-14 22-14 50 0 72" stroke-width="1.6"/><path d="M27 14c14 22 14 50 0 72M73 14c-14 22-14 50 0 72" stroke-width="7" stroke-dasharray="1.6 4.6"/></g>`, { shade: 0.1, gloss: 0 }),
  },
  {
    id: 'gridiron', label: 'NFL', vb: '0 0 120 80', r: 32, w: 1.5,
    shape: '<path d="M8 40C28 6 92 6 112 40 92 74 28 74 8 40z"/>',
    art: `<path d="M8 40C28 6 92 6 112 40 92 74 28 74 8 40z" fill="#8c4a25" stroke="${D}" stroke-width="3"/>
      <path d="M30 18c-6 13-6 31 0 44M90 18c6 13 6 31 0 44" fill="none" stroke="#fff" stroke-width="5"/>
      <g stroke="#fff" stroke-linecap="round"><path d="M44 38h32" stroke-width="3.4"/><path d="M48 32v12M55 32v12M62 32v12M69 32v12" stroke-width="2.8"/></g>
      <path d="M100 52C84 68 36 70 16 50c22 26 70 24 84 2z" fill="#000" opacity=".16"/>
      <path d="M26 26c14-10 34-14 52-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`,
  },
  {
    id: 'helmet', label: 'Formula 1. Hamilton, 44.', vb: '0 0 120 100', r: 36, w: 1.15,
    shape: '<path d="M14 70C10 38 32 12 66 12c28 0 44 20 44 44v16c0 8-6 14-14 14H34c-12 0-19-6-20-16z"/>',
    art: `<path d="M14 70C10 38 32 12 66 12c28 0 44 20 44 44v16c0 8-6 14-14 14H34c-12 0-19-6-20-16z" fill="#f6f6f2" stroke="${D}" stroke-width="3"/>
      <path d="M15 73c26 8 64 8 95-3v6c-28 10-68 10-93 3z" fill="#2142c5"/>
      <path d="M30 23c20-9 52-9 70 6" fill="none" stroke="#d23a2c" stroke-width="3" stroke-linecap="round"/>
      <path d="M62 40h46c1.5 7 2 14 2 20H70c-6 0-10-4-10-10 0-5 .5-8 2-10z" fill="#1d232c" stroke="${D}" stroke-width="2.5"/>
      <path d="M68 45h34" stroke="#9fb3d1" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
      <text x="20" y="64" font-family="${font}" font-weight="700" font-style="italic" font-size="25" letter-spacing="-1.5" fill="${D}">44</text>
      <path d="M24 38c4-10 14-18 26-21" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M110 66v6c0 8-6 14-14 14H34c-9 0-15-4-18-10 8 5 50 6 94-10z" fill="#000" opacity=".1"/>`,
  },
  {
    id: 'pick', label: 'Learning the guitar', vb: '0 0 90 100', r: 26, w: 0.95,
    shape: '<path d="M45 95C26 75 6 50 8 30 10 12 26 5 45 5s35 7 37 25c2 20-18 45-37 65z"/>',
    art: `<path d="M45 95C26 75 6 50 8 30 10 12 26 5 45 5s35 7 37 25c2 20-18 45-37 65z" fill="#2142c5" stroke="${D}" stroke-width="3"/>
      <path d="M20 22c6-8 16-11 28-11" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
      <text x="45" y="52" text-anchor="middle" font-family="${font}" font-weight="600" font-size="11" fill="#fff" opacity=".85">1.0 mm</text>
      <path d="M82 30c2 20-18 45-37 65 10-16 30-40 30-62z" fill="#000" opacity=".15"/>`,
  },
  {
    id: 'ticket', label: 'Chelsea', vb: '0 0 170 80', r: 30, w: 2.1,
    shape: '<path d="M6 2h158a4 4 0 0 1 4 4v22a12 12 0 0 0 0 24v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V52a12 12 0 0 0 0-24V6a4 4 0 0 1 4-4z"/>',
    art: `<path d="M6 2h158a4 4 0 0 1 4 4v22a12 12 0 0 0 0 24v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V52a12 12 0 0 0 0-24V6a4 4 0 0 1 4-4z" fill="#1d3fae" stroke="${D}" stroke-width="3"/>
      <path d="M120 8v64" stroke="#fff" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="3 4"/>
      <g font-family="${font}" fill="#fff"><text x="20" y="24" font-size="8" font-weight="600" letter-spacing="2" opacity=".75">MATCHDAY</text>
      <text x="20" y="46" font-size="16" font-weight="700">STAMFORD</text><text x="20" y="63" font-size="16" font-weight="700">BRIDGE</text>
      <text x="131" y="27" font-size="7" font-weight="600" letter-spacing="1.4" opacity=".75">SEAT</text><text x="129" y="52" font-size="24" font-weight="700">44</text>
      <text x="131" y="66" font-size="6.5" font-weight="600" letter-spacing="1.2" opacity=".75">ADMIT 1</text></g>`,
  },
  {
    id: 'badge', label: 'What my name means', vb: '0 0 100 100', r: 32,
    shape: '<circle cx="50" cy="50" r="42"/>',
    art: `<circle cx="50" cy="50" r="42" fill="${D}"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>
      <path id="st-bd" d="M50 21a29 29 0 1 1 0 58 29 29 0 1 1 0-58" fill="none"/>
      <text font-family="${font}" font-weight="600" font-size="8.2" letter-spacing="1.6" fill="#fff"><textPath href="#st-bd">GOD IS BEHIND ME • GOD IS BEHIND ME •</textPath></text>
      <path d="M50 37l3.4 8.6 9.2.6-7.1 5.9 2.3 8.9L50 56.1l-7.8 4.9 2.3-8.9-7.1-5.9 9.2-.6z" fill="#f2c14a"/>`,
  },
  {
    id: 'pow', label: 'Comics', vb: '0 0 120 100', r: 34, w: 1.15,
    shape: '<polygon points="60,4 70,26 94,10 88,36 116,38 92,54 110,76 82,70 78,96 62,76 44,96 40,70 12,78 28,54 4,40 32,34 22,10 48,24"/>',
    art: `<polygon points="60,4 70,26 94,10 88,36 116,38 92,54 110,76 82,70 78,96 62,76 44,96 40,70 12,78 28,54 4,40 32,34 22,10 48,24" fill="#ffd23c" stroke="${D}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="60,22 66,36 80,28 76,44 92,46 78,56 86,68 72,64 70,78 60,66 50,78 48,64 34,68 42,56 28,46 44,44 40,28 54,36" fill="#ff6b3d"/>
      <text x="60" y="60" text-anchor="middle" font-family="${font}" font-weight="700" font-style="italic" font-size="25" letter-spacing="-1" fill="#fff" stroke="${D}" stroke-width="3" paint-order="stroke">POW!</text>`,
  },
  {
    id: 'sheet', label: 'The day job', vb: '0 0 110 84', r: 30, w: 1.3,
    shape: '<rect x="3" y="3" width="104" height="78" rx="6"/>',
    art: `<rect x="3" y="3" width="104" height="78" rx="6" fill="#fff" stroke="${D}" stroke-width="3"/>
      <path d="M4.5 9a4.5 4.5 0 0 1 4.5-4.5h92a4.5 4.5 0 0 1 4.5 4.5v12h-101z" fill="#1f7a4d"/>
      <text x="12" y="17" font-family="IBM Plex Mono, monospace" font-weight="500" font-size="9.5" fill="#fff">=SUM(B2:B9)</text>
      <g stroke="#d6d6d0" stroke-width="1.2"><path d="M4 36h102M4 50h102M4 64h102M36 22v58M72 22v58"/></g>
      <rect x="37" y="37" width="34" height="12" fill="#cfe8d9" stroke="#1f7a4d" stroke-width="1.5"/>`,
  },
];

export const stickerSvg = (s, cls = '') =>
  `<svg class="stk ${cls}" viewBox="${s.vb}" aria-hidden="true"><g class="cut" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round">${s.shape}</g>${s.art}</svg>`;
