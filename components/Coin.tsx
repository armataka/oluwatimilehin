'use client';
// One Timi, lying flat on the page with sand drifted over it: the sand is the surface of the site.
// Point at it and it lifts towards you in full colour, the sand sliding off its face; leave, and it drops
// back with a puff and the sand settles over it again. Tap to turn it over.
import { useEffect, useRef } from 'react';
import { CoinFace } from './CoinFace';

type Grain = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; c: string; s: number; a: number; t0: number; off: number };
const SAND = ['#f3e9d2', '#eadbb9', '#e0cda3', '#d3bd8f', '#c5ab78', '#b3986a'];
const TAU = Math.PI * 2;

export function Coin() {
  const scene = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  const bed = useRef<HTMLCanvasElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = scene.current!, coin = coinRef.current!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const W = el.clientWidth, H = el.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    const R = coin.offsetWidth / 2, cx = W / 2, cy = H / 2;
    const setup = (cv: HTMLCanvasElement) => { cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d')!; g.scale(dpr, dpr); return g; };
    const gb = setup(bed.current!), gd = setup(dust.current!);
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pick = (r = Math.random()) => SAND[(r * SAND.length) | 0];

    // the bed: a patch of beach on the page. A soft body of sand, then grains over it (pale ones catching light, dark ones in shadow),
    // thinning to nothing at the edges, with a darker hollow where the coin has sunk in.
    const body = gb.createRadialGradient(cx, cy + 4, R * 0.4, cx, cy + 4, R * 1.62);
    body.addColorStop(0, 'rgba(226,209,170,.95)'); body.addColorStop(0.62, 'rgba(228,212,176,.85)'); body.addColorStop(0.85, 'rgba(230,216,184,.35)'); body.addColorStop(1, 'rgba(230,216,184,0)');
    gb.fillStyle = body; gb.fillRect(0, 0, W, H);
    const hollow = gb.createRadialGradient(cx - 2, cy - 2, R * 0.9, cx - 2, cy - 2, R * 1.14);
    hollow.addColorStop(0, 'rgba(92,70,30,.5)'); hollow.addColorStop(1, 'rgba(92,70,30,0)');
    gb.fillStyle = hollow; gb.fillRect(0, 0, W, H);
    const TONE = ['#f6ecd6', '#efe2c4', '#e3d2ab', '#d6c093', '#c5ab78', '#a98e5c', '#8f7648'];
    for (let i = 0; i < 16000; i++) {
      const a = rnd() * TAU, d = R * (0.85 + Math.pow(rnd(), 0.85) * 0.85);
      const wob = 1 + 0.07 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 7);
      const x = cx + Math.cos(a) * d * wob, y = cy + 4 + Math.sin(a) * d * wob;
      const fade = 1 - Math.min(1, Math.max(0, (d - R * 1.1) / (R * 0.6)));
      gb.globalAlpha = (0.35 + rnd() * 0.65) * fade; gb.fillStyle = TONE[(Math.pow(rnd(), 1.3) * TONE.length) | 0];
      const s = rnd() < 0.1 ? 1.8 : rnd() < 0.5 ? 1.2 : 0.9; gb.fillRect(x, y, s, s);
    }
    gb.globalAlpha = 1;

    // the cover: a drift across the lower left, a thin ring over the rim, and a scatter across the face
    const cover: Grain[] = [];
    const add = (a: number, d: number, alpha: number) => {
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      cover.push({ x, y, hx: x, hy: y, vx: 0, vy: 0, c: pick(rnd()), s: rnd() < 0.18 ? 1.7 : 1.15, a: alpha, t0: 0, off: 0 });
    };
    for (let i = 0; i < 2200; i++) add(2.25 + (rnd() + rnd() - 1) * 1.25, R * (0.42 + Math.pow(rnd(), 0.6) * 0.7), 0.75 + rnd() * 0.25);
    for (let i = 0; i < 700; i++) add(5.6 + (rnd() + rnd() - 1) * 0.7, R * (0.78 + rnd() * 0.32), 0.7 + rnd() * 0.3);
    for (let i = 0; i < 1100; i++) add(rnd() * TAU, R * (0.9 + rnd() * 0.2), 0.6 + rnd() * 0.4);
    for (let i = 0; i < 420; i++) add(rnd() * TAU, R * Math.sqrt(rnd()) * 0.9, 0.45 + rnd() * 0.4);

    let up = 0, vu = 0, tu = 0, rx = 0, ry = 0, trx = 0, tTilt = 0, base = 0, vrx = 0, vry = 0;
    let hover = false, raf = 0, mode: 'rest' | 'shed' | 'back' = 'rest', backAt = 0, puffed = true;
    const puff: Grain[] = [];
    // the body of the drift: a soft heap under the loose grains, so it reads as sand lying over the coin
    const ax = cx + Math.cos(2.25) * R * 0.9, ay = cy + Math.sin(2.25) * R * 0.9;
    const drawDrift = (alpha: number) => {
      if (alpha <= 0) return;
      const g = gd.createRadialGradient(ax, ay, 0, ax, ay, R * 0.78);
      g.addColorStop(0, 'rgba(227,211,174,1)'); g.addColorStop(0.6, 'rgba(227,211,174,.96)'); g.addColorStop(1, 'rgba(227,211,174,0)');
      gd.globalAlpha = alpha; gd.fillStyle = g; gd.fillRect(ax - R, ay - R, R * 2, R * 2);
      const bx = cx + Math.cos(5.6) * R * 1.02, by = cy + Math.sin(5.6) * R * 1.02, g2 = gd.createRadialGradient(bx, by, 0, bx, by, R * 0.42);
      g2.addColorStop(0, 'rgba(227,211,174,1)'); g2.addColorStop(0.55, 'rgba(227,211,174,.9)'); g2.addColorStop(1, 'rgba(227,211,174,0)');
      gd.fillStyle = g2; gd.fillRect(bx - R, by - R, R * 2, R * 2);
    };
    let shedAt = 0;
    const drawCover = (alpha: number) => { drawDrift(alpha); for (const g of cover) { gd.globalAlpha = g.a * alpha; gd.fillStyle = g.c; gd.fillRect(g.hx, g.hy, g.s, g.s); } };
    const paint = () => {
      el.style.setProperty('--up', up.toFixed(3));
      coin.style.setProperty('--rx', `${rx.toFixed(2)}deg`); coin.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      coin.style.setProperty('--hx', `${((((ry % 360) + 360) % 360) / 3.6).toFixed(1)}%`);
    };
    const tick = (t: number) => {
      raf = 0;
      vu += (tu - up) * 0.1; vu *= 0.78; up += vu;
      vrx += (trx - rx) * 0.12; vrx *= 0.78; rx += vrx;
      vry += (base + tTilt - ry) * 0.1; vry *= 0.8; ry += vry;
      gd.clearRect(0, 0, W, H);
      let live = 0;
      if (mode === 'shed') {
        const edge = R * 1.12; drawDrift(1 - (t - shedAt) / 320);
        for (const g of cover) {
          if (t < g.t0) { gd.globalAlpha = g.a; gd.fillStyle = g.c; gd.fillRect(g.x, g.y, g.s, g.s); live++; continue; }
          if (g.a <= 0) continue;
          g.vy += 0.16; g.vx *= 0.99; g.x += g.vx; g.y += g.vy;
          if (!g.off && Math.hypot(g.x - cx, g.y - cy) > edge) g.off = 1;     // over the edge: now it's dropping to the sand below
          if (g.off) { g.vx *= 0.8; g.vy *= 0.8; g.a -= 0.035; }
          gd.globalAlpha = Math.max(0, g.a); gd.fillStyle = g.c; gd.fillRect(g.x, g.y, g.s * (g.off ? 0.85 : 1), g.s * (g.off ? 0.85 : 1)); live++;
        }
      } else if (mode === 'back') {
        const k = Math.min(1, (t - backAt) / 700); drawCover(k); if (k < 1) live++; else mode = 'rest';
      } else drawCover(1);
      if (!hover && !puffed && up < 0.08) {           // it lands: a ring of sand jumps outwards, then the cover drifts back
        puffed = true; mode = 'back'; backAt = t; live++;
        if (!still) for (let i = 0; i < 90; i++) { const a = Math.random() * TAU, sp = 0.8 + Math.random() * 2.2; puff.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, hx: 0, hy: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: pick(), s: Math.random() < 0.25 ? 1.7 : 1.1, a: 1, t0: 0, off: 0 }); }
      }
      for (let i = puff.length - 1; i >= 0; i--) {
        const g = puff[i]; g.vx *= 0.9; g.vy *= 0.9; g.x += g.vx; g.y += g.vy; g.a -= 0.035;
        if (g.a <= 0) { puff.splice(i, 1); continue; }
        gd.globalAlpha = g.a; gd.fillStyle = g.c; gd.fillRect(g.x, g.y, g.s, g.s); live++;
      }
      gd.globalAlpha = 1; paint();
      const moving = Math.abs(tu - up) > 0.003 || Math.abs(vu) > 0.003 || Math.abs(base + tTilt - ry) > 0.05 || Math.abs(trx - rx) > 0.05 || Math.abs(vry) > 0.05;
      if (moving || live || hover) raf = requestAnimationFrame(tick);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const sfx = (n: string) => window.dispatchEvent(new CustomEvent('sfx', { detail: n }));

    const enter = () => {
      if (hover) return; hover = true; tu = 1; puffed = false; el.classList.add('up'); sfx('sand');
      const now = performance.now(); mode = 'shed'; shedAt = now;
      for (const g of cover) {
        const dx = g.hx - cx, dy = g.hy - cy, d = Math.hypot(dx, dy) || 1, sp = still ? 0 : 0.5 + Math.random() * 1.6;
        g.x = g.hx; g.y = g.hy; g.vx = (dx / d) * sp + (Math.random() - 0.5) * 0.4; g.vy = (dy / d) * sp * 0.7 - Math.random() * 0.4;
        g.a = still ? 0 : 0.6 + Math.random() * 0.4; g.off = 0; g.t0 = now + Math.random() * 260 + (1 - d / R) * 120;
      }
      go();
    };
    const leave = () => { hover = false; tu = 0; trx = 0; tTilt = 0; el.classList.remove('up'); go(); };
    const move = (e: PointerEvent) => {
      if (still) return; const r = coin.getBoundingClientRect();
      trx = -((e.clientY - r.top) / r.height - 0.5) * 24; tTilt = ((e.clientX - r.left) / r.width - 0.5) * 24; go();
    };
    const flip = () => { base += 180; sfx('coin'); go(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    coin.addEventListener('pointerenter', enter); coin.addEventListener('pointerleave', leave);
    coin.addEventListener('pointermove', move); coin.addEventListener('click', flip); coin.addEventListener('keydown', key);
    coin.addEventListener('focus', enter); coin.addEventListener('blur', leave);
    drawCover(1); paint();
    return () => {
      cancelAnimationFrame(raf);
      coin.removeEventListener('pointerenter', enter); coin.removeEventListener('pointerleave', leave);
      coin.removeEventListener('pointermove', move); coin.removeEventListener('click', flip); coin.removeEventListener('keydown', key);
      coin.removeEventListener('focus', enter); coin.removeEventListener('blur', leave);
    };
  }, []);

  const layers = Array.from({ length: 9 }, (_, i) => i - 4);
  return (
    <div className="coin-scene" ref={scene} data-r>
      <div className="coin-tone">
        <canvas className="sand bed" ref={bed} aria-hidden="true" />
        <span className="coin-shade" aria-hidden="true" />
        <button type="button" className="coin" ref={coinRef} aria-label="One Timi, a coin of my own currency with my portrait struck on it, lying in sand. Press to turn it over.">
          <span className="coin-body">
            {layers.map((z) => <span key={z} className="coin-edge" style={{ ['--z' as string]: `${z * 0.5}px` }} />)}
            {(['front', 'back'] as const).map((side) => (
              <span key={side} className={`coin-face ${side}`}><CoinFace side={side} /><span className="coin-holo" /></span>
            ))}
          </span>
        </button>
        <canvas className="sand dust" ref={dust} aria-hidden="true" />
      </div>
      <span className="coin-hint" aria-hidden="true">Tap to turn it over</span>
    </div>
  );
}
