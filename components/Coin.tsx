'use client';
// One Timi. A coin of my own currency with my portrait on it, half-buried in sand.
// Hover and it lifts out, the sand that covered it pouring off; leave and it settles back with a puff.
// Colour only comes in while you're on it. Tap to flip it over.
import { useEffect, useRef } from 'react';

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

function Face({ side }: { side: 'front' | 'back' }) {
  const id = `coin-${side}`;
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
        <filter id={`${id}-duo`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={DUO} /></filter>
        <clipPath id={`${id}-core`}><circle cx="100" cy="100" r="66" /></clipPath>
        <path id={`${id}-legend`} d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
      </defs>
      {/* rim, reeding and field */}
      <circle cx="100" cy="100" r="99.5" fill={`url(#${id}-rim)`} />
      <path d={TICKS} stroke="#5c3d0c" strokeWidth=".7" opacity=".7" />
      <circle cx="100" cy="100" r="92" fill={`url(#${id}-field)`} stroke="#3a2708" strokeWidth="1" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#${id}-gold)`} strokeWidth=".9" strokeDasharray="1.2 2.2" opacity=".85" />
      <text className="coin-legend" fill={`url(#${id}-gold)`}>
        <textPath href={`#${id}-legend`} textLength="500" lengthAdjust="spacing">
          {side === 'front' ? 'OLUWATIMILEHIN · PRODUCT DESIGNER · MMXXVI · ' : 'GOD IS BEHIND ME · ONE TIMI · LEGAL TENDER FOR GOOD WORK · '}
        </textPath>
      </text>
      {side === 'front' ? (
        <g clipPath={`url(#${id}-core)`}>
          {GUILLOCHE.map((d, i) => <path key={i} d={d} fill="none" stroke="#d9ac4f" strokeWidth=".3" opacity=".16" />)}
          {/* my portrait, struck in gold */}
          <image href="/coin/bust.svg" x="22" y="24" width="156" height="156" filter={`url(#${id}-duo)`} />
        </g>
      ) : (
        <g>
          {GUILLOCHE.map((d, i) => <path key={i} d={d} fill="none" stroke="#d9ac4f" strokeWidth=".35" opacity={0.28 - i * 0.05} />)}
          <text x="100" y="113" className="coin-denom" fill={`url(#${id}-gold)`}>1</text>
          <text x="100" y="134" className="coin-small" fill="#e2b04f">ONE TIMI</text>
          <text x="100" y="69" className="coin-tiny" fill="#c99a45">Nº OO 000001</text>
        </g>
      )}
    </svg>
  );
}

type Grain = { x: number; y: number; vx: number; vy: number; c: string; s: number; life: number; land: number };
const SAND = ['#e9dcbf', '#dfcca5', '#d2bb8e', '#f3e9d2', '#c3a675', '#b6976a'];

export function Coin() {
  const scene = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  const bed = useRef<HTMLCanvasElement>(null);
  const lip = useRef<HTMLCanvasElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = scene.current!, coin = coinRef.current!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const W = el.clientWidth, H = el.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    const C = coin.offsetWidth, R = C / 2;
    const cx = W / 2, rest = H - 34;              // the sand's surface under the coin
    const coinTop0 = rest - C + 16;               // resting: the bottom 16px are under the sand
    const surface = (x: number) => rest - 20 * Math.exp(-(((x - cx) / (W * 0.36)) ** 2));

    const setup = (cv: HTMLCanvasElement) => { cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d')!; g.scale(dpr, dpr); return g; };
    const gb = setup(bed.current!), gl = setup(lip.current!), gd = setup(dust.current!);
    // a seeded random, so the sand looks the same every visit
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const grain = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.fillRect(x, y, s, s); };
    // the bed: a low mound of grains
    const gauss = () => { let u = 0; for (let k = 0; k < 4; k++) u += rnd(); return (u - 2) / 2; };
    for (let i = 0; i < 7000; i++) {
      const x = cx + gauss() * W * 0.62;
      const top = surface(x), y = top + Math.pow(rnd(), 2.2) * (H - 8 - top) * (1 - Math.min(1, Math.abs(x - cx) / (W * 0.62)) * 0.6);
      const fade = 1 - Math.min(1, Math.abs(x - cx) / (W * 0.55));
      grain(gb, x, y, rnd() < 0.15 ? 1.6 : 1.05, SAND[(rnd() * SAND.length) | 0], (0.45 + rnd() * 0.55) * (0.3 + fade * 0.7));
    }
    // the lip: sand piled against the front of the coin, covering its lowest part
    // a soft dune hugging the coin's base, so nothing of the buried part shows, then grains on top for texture
    const dune = gl.createRadialGradient(cx, rest + 4, 0, cx, rest + 4, R + 16);
    dune.addColorStop(0, '#e6d6b4'); dune.addColorStop(0.82, '#e6d6b4'); dune.addColorStop(1, 'rgba(230,214,180,0)');
    gl.save(); gl.translate(cx, rest + 4); gl.scale(1, 22 / (R + 16)); gl.translate(-cx, -(rest + 4));
    gl.fillStyle = dune; gl.beginPath(); gl.arc(cx, rest + 4, R + 16, 0, TAU); gl.fill(); gl.restore();
    for (let i = 0; i < 3600; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd());
      const x = cx + Math.cos(a) * d * (R + 18), y = rest + 4 + Math.sin(a) * d * 23;
      grain(gl, x, y, rnd() < 0.18 ? 1.6 : 1.1, SAND[(rnd() * SAND.length) | 0], (0.65 + rnd() * 0.35) * (1 - d * 0.5));
    }
    gb.globalAlpha = gl.globalAlpha = 1;
    coin.style.top = `${coinTop0}px`;

    // motion
    let lift = 0, vl = 0, tl = 0, rx = 0, ry = 0, trx = 0, tTilt = 0, base = 0, vry = 0, vrx = 0;
    let hover = false, raf = 0, emitUntil = 0, puffArmed = false;
    const grains: Grain[] = [];
    const pick = () => SAND[(Math.random() * SAND.length) | 0];
    const spawnFall = (n: number) => {
      const top = coinTop0 - lift;
      for (let i = 0; i < n; i++) {
        // from the lower part of the coin that was under the sand, and a little off its face
        const a = Math.PI * (0.1 + Math.random() * 0.8);
        const rr = R * (0.55 + Math.random() * 0.45);
        grains.push({ x: cx + Math.cos(a) * rr, y: top + R + Math.sin(a) * rr * 0.9, vx: (Math.random() - 0.5) * 0.6, vy: -0.3 + Math.random() * 0.8, c: pick(), s: Math.random() < 0.2 ? 1.7 : 1.15, life: 1, land: 0 });
      }
    };
    const spawnPuff = () => {
      for (let i = 0; i < 70; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        grains.push({ x: cx + side * R * (0.55 + Math.random() * 0.45), y: rest - 6, vx: side * (0.6 + Math.random() * 1.6), vy: -(0.8 + Math.random() * 1.8), c: pick(), s: Math.random() < 0.25 ? 1.6 : 1.1, life: 1, land: 0 });
      }
    };
    const paint = () => {
      coin.style.setProperty('--lift', `${(-lift).toFixed(2)}px`);
      coin.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      coin.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      el.style.setProperty('--up', Math.min(1, lift / 34).toFixed(3));
      coin.style.setProperty('--hx', `${((((ry % 360) + 360) % 360) / 3.6).toFixed(1)}%`);
    };
    const tick = (t: number) => {
      raf = 0;
      if (t < emitUntil && hover) spawnFall(9);
      vl += (tl - lift) * 0.09; vl *= 0.8; lift += vl;
      vrx += (trx - rx) * 0.12; vrx *= 0.78; rx += vrx;
      vry += (base + tTilt - ry) * 0.1; vry *= 0.8; ry += vry;
      if (puffArmed && !hover && lift < 3) { puffArmed = false; if (!still) spawnPuff(); }
      // grains: fall, land on the sand, fade into it
      gd.clearRect(0, 0, W, H);
      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i];
        if (!g.land) {
          g.vy += 0.28; g.vx *= 0.985; g.x += g.vx; g.y += g.vy;
          const s = surface(g.x) + Math.random() * 6;
          if (g.vy > 0 && g.y >= s) { g.y = s; g.land = 1; }
        } else g.life -= 0.025;
        if (g.life <= 0 || g.x < -4 || g.x > W + 4) { grains.splice(i, 1); continue; }
        gd.globalAlpha = Math.max(0, g.life); gd.fillStyle = g.c; gd.fillRect(g.x, g.y, g.s, g.s);
      }
      gd.globalAlpha = 1;
      paint();
      const moving = Math.abs(tl - lift) > 0.05 || Math.abs(vl) > 0.05 || Math.abs(base + tTilt - ry) > 0.05 || Math.abs(trx - rx) > 0.05 || Math.abs(vry) > 0.05;
      if (moving || grains.length || hover) raf = requestAnimationFrame(tick);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const enter = () => { if (hover) return; hover = true; tl = 34; window.dispatchEvent(new CustomEvent('sfx', { detail: 'sand' })); if (!still) emitUntil = performance.now() + 520; puffArmed = true; el.classList.add('up'); go(); };
    const leave = () => { hover = false; tl = 0; trx = 0; tTilt = 0; el.classList.remove('up'); go(); };
    const move = (e: PointerEvent) => {
      if (still) return;
      const r = coin.getBoundingClientRect();
      trx = -((e.clientY - r.top) / r.height - 0.5) * 22; tTilt = ((e.clientX - r.left) / r.width - 0.5) * 26; go();
    };
    const flip = () => { base += 180; window.dispatchEvent(new CustomEvent('sfx', { detail: 'coin' })); go(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    coin.addEventListener('pointerenter', enter); coin.addEventListener('pointerleave', leave);
    coin.addEventListener('pointermove', move); coin.addEventListener('click', flip); coin.addEventListener('keydown', key);
    coin.addEventListener('focus', enter); coin.addEventListener('blur', leave);
    paint();
    return () => {
      cancelAnimationFrame(raf);
      coin.removeEventListener('pointerenter', enter); coin.removeEventListener('pointerleave', leave);
      coin.removeEventListener('pointermove', move); coin.removeEventListener('click', flip); coin.removeEventListener('keydown', key);
      coin.removeEventListener('focus', enter); coin.removeEventListener('blur', leave);
    };
  }, []);

  const layers = Array.from({ length: 11 }, (_, i) => i - 5);
  return (
    <div className="coin-scene" ref={scene} data-r>
      <div className="coin-tone">
      <canvas className="sand bed" ref={bed} aria-hidden="true" />
      <span className="coin-shade" aria-hidden="true" />
      <button type="button" className="coin" ref={coinRef} aria-label="One Timi, a coin of my own currency with my portrait on it. Press to flip it.">
        <span className="coin-body">
          {layers.map((z) => <span key={z} className="coin-edge" style={{ ['--z' as string]: `${z * 0.5}px` }} />)}
          {(['front', 'back'] as const).map((side) => (
            <span key={side} className={`coin-face ${side}`}>
              <Face side={side} />
              <span className="coin-holo" />
            </span>
          ))}
        </span>
      </button>
      <canvas className="sand lip" ref={lip} aria-hidden="true" />
      <canvas className="sand dust" ref={dust} aria-hidden="true" />
      </div>
      <span className="coin-hint" aria-hidden="true">Tap to flip</span>
    </div>
  );
}
