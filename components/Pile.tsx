'use client';
// The Me page's footer holds a pile of stickers. They drop in the first time the footer is uncovered;
// pick one up and throw it, and they knock into each other. Only on Me.
import { useEffect, useRef } from 'react';
import { stickers, stickerSvg } from '@/lib/stickers';

type Body = { el: HTMLElement; r0: number; r: number; w: number; x: number; y: number; vx: number; vy: number; a: number; held: boolean; tilt: number };

export function Pile({ open }: { open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useRef<{ drop: () => void } | null>(null);
  const dropped = useRef(false);

  useEffect(() => {
    const arena = ref.current!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bodies: Body[] = [...arena.querySelectorAll<HTMLElement>('.toy')].map((el, i) => ({
      el, r0: +el.dataset.rad!, r: 0, w: +el.dataset.w!, x: 0, y: 0, vx: 0, vy: 0, a: 0, held: false, tilt: ((i * 37) % 24) - 12,
    }));
    let W = 0, H = 0, raf = 0, quiet = 0;
    const size = () => {
      W = arena.clientWidth; H = arena.clientHeight;
      const k = W < 640 ? 0.62 : 0.95;
      bodies.forEach((b) => { b.r = b.r0 * k; b.el.style.width = `${b.r * 2 * b.w}px`; });
    };
    const draw = () => bodies.forEach((b) => { b.el.style.transform = `translate(${b.x}px,${b.y}px) translate(-50%,-50%) rotate(${b.a}deg)`; });
    const rest = () => {
      const n = bodies.length, pad = 40;
      bodies.forEach((b, i) => { b.x = pad + ((W - pad * 2) * (((i * 5) % n) + 0.5)) / n; b.y = H - b.r; b.vx = b.vy = 0; b.a = b.w >= 1.3 ? b.tilt * 0.4 : b.tilt * 3; });
    };
    const step = () => {
      raf = 0; let e = 0, held = false;
      for (const b of bodies) {
        if (b.held) { held = true; continue; }
        b.vy += 0.55; b.vx *= 0.992; b.x += b.vx; b.y += b.vy;
        const floor = b.y >= H - b.r - 1;
        if (b.w >= 1.3 && floor && Math.abs(b.vx) < 2.5) { const t = Math.round(b.a / 360) * 360 + b.tilt * 0.4; b.a += (t - b.a) * 0.14; b.vx *= 0.9; e += Math.abs(t - b.a) * 0.1; }
        else b.a += (b.vx / b.r) * 40;
        if (b.y > H - b.r) { b.y = H - b.r; if (b.vy > 0) b.vy *= -0.36; if (Math.abs(b.vy) < 1) b.vy = 0; b.vx *= 0.93; }
        const hw = b.r * Math.max(1, b.w);
        if (b.x < hw) { b.x = hw; b.vx = Math.abs(b.vx) * 0.5; }
        if (b.x > W - hw) { b.x = W - hw; b.vx = -Math.abs(b.vx) * 0.5; }
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const p = bodies[i], q = bodies[j];
        let dx = q.x - p.x, dy = q.y - p.y;
        const d = Math.hypot(dx, dy), min = p.r + q.r;
        if (d >= min || d === 0) continue;
        dx /= d; dy /= d;
        const o = min - d, pm = p.held ? 0 : q.held ? 1 : 0.5, qm = q.held ? 0 : p.held ? 1 : 0.5;
        p.x -= dx * o * pm; p.y -= dy * o * pm; q.x += dx * o * qm; q.y += dy * o * qm;
        const vn = (q.vx - p.vx) * dx + (q.vy - p.vy) * dy;
        if (vn < 0) { const jn = (-1.3 * vn) / 2; if (!p.held) { p.vx -= jn * dx; p.vy -= jn * dy; } if (!q.held) { q.vx += jn * dx; q.vy += jn * dy; } }
      }
      bodies.forEach((b) => { e += Math.abs(b.vx) + Math.abs(b.vy); });
      draw();
      quiet = e < bodies.length * 0.6 && !held ? quiet + 1 : 0;
      if (quiet < 60) raf = requestAnimationFrame(step);
    };
    const run = () => { quiet = 0; if (!raf && !still) raf = requestAnimationFrame(step); };

    size();
    if (still) { rest(); draw(); arena.classList.add('live'); }
    // first reveal: they fall in from the top of the footer, a few at a time
    api.current = {
      drop: () => {
        if (still) return;
        bodies.forEach((b, i) => { b.x = 40 + ((W - 80) * (((i * 5) % bodies.length) + 0.5)) / bodies.length; b.y = -b.r - (i % 4) * 50; b.vx = ((i * 7) % 5) - 2; b.vy = 2; b.a = b.tilt * 3; });
        draw(); arena.classList.add('live'); run();
      },
    };

    let grab: Body | null = null;
    const down = (e: PointerEvent) => {
      const el = (e.target as Element).closest('.toy') as HTMLElement | null; if (!el) return;
      grab = bodies.find((b) => b.el === el) ?? null; if (!grab) return;
      grab.held = true; grab.vx = grab.vy = 0; el.setPointerCapture(e.pointerId); el.classList.add('held'); run();
    };
    const move = (e: PointerEvent) => {
      if (!grab) return;
      const rc = arena.getBoundingClientRect();
      const nx = Math.max(grab.r, Math.min(W - grab.r, e.clientX - rc.left)), ny = Math.max(grab.r, Math.min(H - grab.r, e.clientY - rc.top));
      grab.vx = Math.max(-30, Math.min(30, nx - grab.x)); grab.vy = Math.max(-30, Math.min(30, ny - grab.y)); grab.x = nx; grab.y = ny;
    };
    const up = () => { if (grab) { grab.el.classList.remove('held'); grab.held = false; grab = null; run(); } };
    arena.addEventListener('pointerdown', down); arena.addEventListener('pointermove', move);
    arena.addEventListener('pointerup', up); arena.addEventListener('pointercancel', up);
    const onResize = () => { size(); run(); };
    addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => {
    if (open && !dropped.current) { dropped.current = true; api.current?.drop(); }
  }, [open]);

  return (
    <div className="pile" ref={ref} aria-hidden="true">
      {stickers.map((s) => (
        <div key={s.id} className="toy" data-rad={s.r} data-w={s.w ?? 1} title={s.label} dangerouslySetInnerHTML={{ __html: stickerSvg(s) }} />
      ))}
    </div>
  );
}
