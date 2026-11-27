// The two faces of One Timi, struck as relief. Everything here is drawn as a height map (white is raised, black is sunk)
// and then lit from the top left by an SVG lighting filter, so it reads as engraved metal, not a printed picture.
// Front: my own bust illustration. Back: the denomination. It's a currency.
const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (r: number, a: number) => `${r2(100 + r * Math.cos(a))} ${r2(100 + r * Math.sin(a))}`;
const REEDS = Array.from({ length: 120 }, (_, i) => `M${pt(94.5, (i / 120) * TAU)}L${pt(99.6, (i / 120) * TAU)}`).join('');
const BEADS = Array.from({ length: 72 }, (_, i) => ({ x: r2(100 + 89.5 * Math.cos((i / 72) * TAU)), y: r2(100 + 89.5 * Math.sin((i / 72) * TAU)) }));
const RAYS = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * TAU; return `M${pt(30, a)}L${pt(i % 2 ? 56 : 63, a)}`; }).join('');
const star = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.42 : r; return `${r2(cx + q * Math.cos(a))},${r2(cy + q * Math.sin(a))}`; }).join(' ');

export function CoinFace({ side, idp = 'coin' }: { side: 'front' | 'back'; idp?: string }) {
  const id = `${idp}-${side}`;
  return (
    <svg className="coin-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        {/* height map → lit metal */}
        <filter id={`${id}-strike`} x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="h0" />
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed={side === 'front' ? 3 : 8} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .06 .06 0 0 0" result="pit" />
          <feComposite in="h0" in2="pit" operator="arithmetic" k2="1" k3="-0.5" result="h1" />
          <feGaussianBlur in="h1" stdDeviation=".55" result="h" />
          <feDiffuseLighting in="h" surfaceScale="5" diffuseConstant="1.05" lightingColor="#d9b46a" result="d"><feDistantLight azimuth="225" elevation="48" /></feDiffuseLighting>
          <feSpecularLighting in="h" surfaceScale="5" specularConstant=".55" specularExponent="22" lightingColor="#fff6d8" result="s"><feDistantLight azimuth="225" elevation="52" /></feSpecularLighting>
          <feComposite in="d" in2="s" operator="arithmetic" k2="1" k3="1" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        {/* the portrait as relief: its darks sit at field level, its lights are raised */}
        <filter id={`${id}-relief`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncR type="linear" slope=".5" intercept=".42" /><feFuncG type="linear" slope=".5" intercept=".42" /><feFuncB type="linear" slope=".5" intercept=".42" /></feComponentTransfer>
        </filter>
        <clipPath id={`${id}-core`}><circle cx="100" cy="100" r="67" /></clipPath>
        <path id={`${id}-legend`} d="M100 100m-77 0a77 77 0 1 1 154 0a77 77 0 1 1-154 0" />
        <radialGradient id={`${id}-dish`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#6c6c6c" /><stop offset=".8" stopColor="#666" /><stop offset="1" stopColor="#5a5a5a" /></radialGradient>
      </defs>
      <g filter={`url(#${id}-strike)`}>
        <circle cx="100" cy="100" r="99.6" fill="#f4f4f4" />
        <path d={REEDS} stroke="#6a6a6a" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="93" fill={`url(#${id}-dish)`} />
        {BEADS.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r="1.25" fill="#eee" />)}
        <circle cx="100" cy="100" r="68.5" fill="none" stroke="#e8e8e8" strokeWidth="1.6" />
        <text className="coin-legend" fill="#f6f6f6">
          <textPath href={`#${id}-legend`} textLength="476" lengthAdjust="spacing">
            {side === 'front' ? 'OLUWATIMILEHIN ★ PRODUCT DESIGNER ★ MMXXVI ★ ' : 'GOD IS BEHIND ME ★ LEGAL TENDER FOR GOOD WORK ★ '}
          </textPath>
        </text>
        {side === 'front' ? (
          <g clipPath={`url(#${id}-core)`}>
            <image href="/coin/bust.svg" x="20" y="24" width="160" height="160" filter={`url(#${id}-relief)`} />
          </g>
        ) : (
          <g>
            <path d={RAYS} stroke="#8a8a8a" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="31" fill="#666" />
            <text x="100" y="121" className="coin-denom" fill="#fafafa">1</text>
            <text x="100" y="152" className="coin-small" fill="#f2f2f2">ONE TIMI</text>
            <polygon points={star(52, 100, 5)} fill="#eee" /><polygon points={star(148, 100, 5)} fill="#eee" />
            <text x="100" y="54" className="coin-tiny" fill="#e6e6e6">2026</text>
          </g>
        )}
      </g>
    </svg>
  );
}
