'use client';
// One Timi: a coin of my own currency. Bimetallic, with an enamel ring, a gold core, guilloché engraving,
// microtext, a reeded edge, a holographic sheen that shifts as it tilts, and a latent "OO" that only shows at an angle.
// Hover to tilt it, drag to spin it, tap (or press Enter) to flip it.
import { useEffect, useRef } from 'react';

// ---- engraving, worked out once ----
const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;

// guilloché: an epitrochoid rosette, the line pattern on banknotes
function rosette(R: number, r: number, d: number, scale: number, turns: number, steps = 900) {
  let p = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TAU * turns;
    const x = (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t);
    const y = (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t);
    p += `${i ? 'L' : 'M'}${r2(100 + x * scale)} ${r2(100 + y * scale)}`;
  }
  return p + 'Z';
}
const ROSETTES = [
  { d: rosette(30, 1, 1.7, 2.02, 1, 1400), o: 0.5 },
  { d: rosette(24, 1, 2.2, 2.2, 1, 1200), o: 0.4 },
  { d: rosette(18, 1, 1.4, 2.3, 1, 1000), o: 0.45 },
  { d: rosette(12, 1, 2.4, 2.4, 1, 800), o: 0.3 },
];
// sun rays behind the mark: light behind, for "God is behind me"
const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * TAU, long = i % 2 === 0;
  const r0 = 20, r1 = long ? 64 : 54;
  return `M${r2(100 + r0 * Math.cos(a))} ${r2(100 + r0 * Math.sin(a))}L${r2(100 + r1 * Math.cos(a - 0.025))} ${r2(100 + r1 * Math.sin(a - 0.025))}L${r2(100 + r1 * Math.cos(a + 0.025))} ${r2(100 + r1 * Math.sin(a + 0.025))}Z`;
}).join('');
// reeding ticks around the rim
const TICKS = Array.from({ length: 120 }, (_, i) => {
  const a = (i / 120) * TAU;
  return `M${r2(100 + 96 * Math.cos(a))} ${r2(100 + 96 * Math.sin(a))}L${r2(100 + 99.5 * Math.cos(a))} ${r2(100 + 99.5 * Math.sin(a))}`;
}).join('');
// beads between ring and core
const BEADS = Array.from({ length: 60 }, (_, i) => {
  const a = (i / 60) * TAU;
  return { x: r2(100 + 72.5 * Math.cos(a)), y: r2(100 + 72.5 * Math.sin(a)) };
});
const MICRO = 'OLUWATIMILEHIN · '.repeat(6);

function Engraving({ side }: { side: 'front' | 'back' }) {
  const id = `c-${side}`;
  return (
    <svg className="coin-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id={`${id}-ring`} d="M100 100m-84 0a84 84 0 1 1 168 0a84 84 0 1 1-168 0" />
        <path id={`${id}-micro`} d="M100 100m-68 0a68 68 0 1 1 136 0a68 68 0 1 1-136 0" />
        <radialGradient id={`${id}-emboss`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset=".55" stopColor="#e8b53a" />
          <stop offset="1" stopColor="#8a5a06" />
        </radialGradient>
      </defs>
      {/* rim reeding and the bead row */}
      <path d={TICKS} stroke="rgb(255 255 255 / .55)" strokeWidth=".7" />
      {BEADS.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r=".9" fill="#fff3c4" opacity=".9" />)}
      {/* legend on the enamel ring */}
      <text className="coin-legend">
        <textPath href={`#${id}-ring`} startOffset="0" textLength="524" lengthAdjust="spacing">
          {side === 'front' ? 'OLUWATIMILEHIN · PRODUCT DESIGNER · LAGOS · MMXXVI · ' : 'GOD IS BEHIND ME · ONE TIMI · LEGAL TENDER FOR GOOD WORK · '}
        </textPath>
      </text>
      {/* microtext you'd need a loupe for */}
      <text className="coin-micro"><textPath href={`#${id}-micro`} textLength="425" lengthAdjust="spacing">{MICRO}</textPath></text>
      {/* guilloché in the core */}
      {ROSETTES.map((r, i) => <path key={i} d={r.d} fill="none" stroke="#6b4300" strokeWidth=".35" opacity={r.o} />)}
      {side === 'front' ? (
        <g>
          <path d={RAYS} fill="#7a4d00" opacity=".28" />
          <circle cx="100" cy="100" r="24" fill={`url(#${id}-emboss)`} stroke="#6b4300" strokeWidth=".8" />
          {/* Ọ, with the dot below, as Yoruba writes it */}
          <text x="100" y="109" className="coin-mark" fill="#5a3700">O</text>
          <circle cx="100" cy="118.5" r="1.8" fill="#5a3700" />
          <text x="100" y="146" className="coin-small" fill="#5a3700">2026</text>
          <text x="139" y="103" className="coin-tiny" fill="#5a3700">LOS</text>
        </g>
      ) : (
        <g>
          <text x="100" y="114" className="coin-denom" fill={`url(#${id}-emboss)`} stroke="#5a3700" strokeWidth=".9">1</text>
          <text x="100" y="134" className="coin-small" fill="#5a3700">ONE TIMI</text>
          {/* the work: a tiny bar chart, for operational software */}
          <g fill="#5a3700" opacity=".7">
            {[5, 9, 7, 12, 10].map((h, i) => <rect key={i} x={89 + i * 4.6} y={150 - h} width="2.6" height={h} rx=".6" />)}
          </g>
          <text x="100" y="66" className="coin-tiny" fill="#5a3700">Nº OO 000001</text>
        </g>
      )}
    </svg>
  );
}

export function Coin() {
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = wrap.current!, coin = btn.current!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rx = 0, ry = 0, trx = 0, tTilt = 0, base = 0, spin = 0, vel = 0, vrx = 0, vry = 0;
    let dragging = false, lastX = 0, moved = 0, raf = 0, hover = false, px = 0.5, py = 0.5;

    const paint = () => {
      const k = ((ry % 360) + 360) % 360;
      coin.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      coin.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      // sheen and glare move with the angle and the pointer
      coin.style.setProperty('--hx', `${((k / 360) * 100 + px * 40).toFixed(1)}%`);
      coin.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      coin.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      coin.style.setProperty('--latent', Math.min(1, Math.max(0, (Math.abs(rx) - 8) / 10)).toFixed(2));
    };
    const tick = () => {
      raf = 0;
      if (!dragging && Math.abs(vel) > 0.4) { spin += vel; vel *= 0.95; }             // coasting after a throw
      else if (!dragging && Math.abs(vel) <= 0.4 && vel !== 0) { vel = 0; base = Math.round(spin / 180) * 180; } // settle on a face
      const tryy = dragging || vel ? spin : base + tTilt;
      if (!dragging && !vel) spin += (base - spin) * 0.2;
      // springs, so it overshoots a touch and settles
      vrx += (trx - rx) * 0.12; vrx *= 0.78; rx += vrx;
      vry += (tryy - ry) * 0.12; vry *= 0.78; ry += vry;
      paint();
      if (dragging || vel || hover || Math.abs(trx - rx) > 0.05 || Math.abs(tryy - ry) > 0.05 || Math.abs(vry) > 0.05) raf = requestAnimationFrame(tick);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const flip = () => { base = Math.round(spin / 180) * 180 + 180; spin = base - 180; vel = 0; go(); };

    const onMove = (e: PointerEvent) => {
      const r = coin.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); spin += dx * 0.9; vel = dx * 0.9; }
      else if (!still) { trx = -(py - 0.5) * 34; tTilt = (px - 0.5) * 34; }
      go();
    };
    const onEnter = () => { hover = true; go(); };
    const onLeave = () => { hover = false; trx = 0; tTilt = 0; px = 0.5; py = 0.5; go(); };
    const onDown = (e: PointerEvent) => { dragging = true; moved = 0; lastX = e.clientX; spin = ry; vel = 0; coin.setPointerCapture(e.pointerId); el.classList.add('held'); go(); };
    const onUp = () => {
      if (!dragging) return; dragging = false; el.classList.remove('held');
      if (moved < 5) flip();                       // a tap flips it
      else if (Math.abs(vel) < 2) { base = Math.round(spin / 180) * 180; vel = 0; }
      go();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };

    coin.addEventListener('pointerenter', onEnter); coin.addEventListener('pointerleave', onLeave);
    coin.addEventListener('pointermove', onMove); coin.addEventListener('pointerdown', onDown);
    coin.addEventListener('pointerup', onUp); coin.addEventListener('pointercancel', onUp);
    coin.addEventListener('keydown', onKey);
    paint();
    return () => {
      cancelAnimationFrame(raf);
      coin.removeEventListener('pointerenter', onEnter); coin.removeEventListener('pointerleave', onLeave);
      coin.removeEventListener('pointermove', onMove); coin.removeEventListener('pointerdown', onDown);
      coin.removeEventListener('pointerup', onUp); coin.removeEventListener('pointercancel', onUp);
      coin.removeEventListener('keydown', onKey);
    };
  }, []);

  const layers = Array.from({ length: 13 }, (_, i) => i - 6);
  return (
    <div className="coin-wrap" ref={wrap} data-r>
      <div className="coin-float">
        <button type="button" className="coin" ref={btn} aria-label="One Timi, a coin of my own currency. Press to flip it.">
          <span className="coin-body">
            {layers.map((z) => <span key={z} className="coin-edge" style={{ ['--z' as string]: `${z * 0.5}px` }} />)}
            {(['front', 'back'] as const).map((side) => (
              <span key={side} className={`coin-face ${side}`}>
                <span className="coin-ring" />
                <span className="coin-core" />
                <Engraving side={side} />
                {side === 'back' ? <span className="coin-latent">OO</span> : null}
                <span className="coin-holo" />
                <span className="coin-glare" />
              </span>
            ))}
          </span>
        </button>
        <span className="coin-shadow" aria-hidden="true" />
      </div>
      <span className="coin-hint" aria-hidden="true">Drag to spin · tap to flip</span>
    </div>
  );
}
