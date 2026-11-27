// The two faces of One Timi. Front: my own bust illustration, struck in gold. Back: my portrait in full colour.
const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;
const TICKS = Array.from({ length: 150 }, (_, i) => {
  const a = (i / 150) * TAU;
  return `M${r2(100 + 95.5 * Math.cos(a))} ${r2(100 + 95.5 * Math.sin(a))}L${r2(100 + 99.4 * Math.cos(a))} ${r2(100 + 99.4 * Math.sin(a))}`;
}).join('');
function rosette(R: number, r: number, d: number, scale: number, steps = 1200) {
  let p = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TAU;
    const x = (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t);
    const y = (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t);
    p += `${i ? 'L' : 'M'}${r2(100 + x * scale)} ${r2(100 + y * scale)}`;
  }
  return p + 'Z';
}
const GUILLOCHE = [rosette(30, 1, 1.7, 1.95), rosette(24, 1, 2.2, 2.1), rosette(18, 1, 1.4, 2.2)];
// black becomes dark bronze, white becomes bright gold
const DUO = (() => {
  const d = [0.16, 0.11, 0.04], l = [0.98, 0.84, 0.5];
  const row = (k: number) => `${0.2126 * (l[k] - d[k])} ${0.7152 * (l[k] - d[k])} ${0.0722 * (l[k] - d[k])} 0 ${d[k]}`;
  return `${row(0)} ${row(1)} ${row(2)} 0 0 0 1 0`;
})();

export function CoinFace({ side, idp = 'coin' }: { side: 'front' | 'back'; idp?: string }) {
  const id = `${idp}-${side}`;
  return (
    <svg className="coin-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-field`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#2c2a27" /><stop offset=".6" stopColor="#141312" /><stop offset="1" stopColor="#0a0a09" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" /><stop offset=".25" stopColor="#d9ac4f" /><stop offset=".55" stopColor="#8f6420" /><stop offset=".8" stopColor="#e8c06a" /><stop offset="1" stopColor="#7a5216" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6a3" /><stop offset=".5" stopColor="#e2b04f" /><stop offset="1" stopColor="#9a6a1c" />
        </linearGradient>
        <radialGradient id={`${id}-vig`} cx="50%" cy="50%" r="50%">
          <stop offset=".72" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
        <filter id={`${id}-duo`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={DUO} /></filter>
        <clipPath id={`${id}-core`}><circle cx="100" cy="100" r="66" /></clipPath>
        <path id={`${id}-legend`} d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
      </defs>
      <circle cx="100" cy="100" r="99.5" fill={`url(#${id}-rim)`} />
      <path d={TICKS} stroke="#5c3d0c" strokeWidth=".7" opacity=".7" />
      <circle cx="100" cy="100" r="92" fill={`url(#${id}-field)`} stroke="#3a2708" strokeWidth="1" />
      <text className="coin-legend" fill={`url(#${id}-gold)`}>
        <textPath href={`#${id}-legend`} textLength="500" lengthAdjust="spacing">
          {side === 'front' ? 'OLUWATIMILEHIN · PRODUCT DESIGNER · MMXXVI · ' : 'GOD IS BEHIND ME · ONE TIMI · LEGAL TENDER FOR GOOD WORK · '}
        </textPath>
      </text>
      {side === 'front' ? (
        <g clipPath={`url(#${id}-core)`}>
          {GUILLOCHE.map((d, i) => <path key={i} d={d} fill="none" stroke="#d9ac4f" strokeWidth=".3" opacity=".16" />)}
          <image href="/coin/bust.svg" x="22" y="24" width="156" height="156" filter={`url(#${id}-duo)`} />
        </g>
      ) : (
        <g clipPath={`url(#${id}-core)`}>
          <image href="/coin/portrait.webp" x="34" y="34" width="132" height="132" preserveAspectRatio="xMidYMid slice" />
          <circle cx="100" cy="100" r="66" fill={`url(#${id}-vig)`} />
        </g>
      )}
      <circle cx="100" cy="100" r="66.5" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.4" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#${id}-gold)`} strokeWidth=".8" strokeDasharray="1.2 2.2" opacity=".8" />
    </svg>
  );
}
