'use client';
// A strip of screens that drifts slowly sideways, on a loop. Hover to pause, drag to move it, click a screen to enlarge it.
// After Jesper Vos's project galleries.
import { useEffect, useRef } from 'react';

type Item = { src?: string | null; label?: string };

export function Gallery({ items = [] }: { items: Item[] }) {
  const track = useRef<HTMLDivElement>(null);
  const shots = items.filter((i) => i.src);

  useEffect(() => {
    const el = track.current; if (!el || !shots.length) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = 0, v = 0, raf = 0, hover = false, drag = false, lastX = 0, moved = 0, half = 0, last = performance.now();
    const measure = () => { half = el.scrollWidth / 2; };
    const tick = (t: number) => {
      const dt = Math.min(48, t - last); last = t;
      if (!drag) {
        const target = still || hover ? 0 : -0.028 * dt;  // px per ms
        v += (target - v) * 0.06;
        x += v + (hover ? 0 : 0) ;
      }
      if (half) { while (x <= -half) x += half; while (x > 0) x -= half; }
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    const enter = () => { hover = true; };
    const leave = () => { hover = false; };
    const down = (e: PointerEvent) => { drag = true; moved = 0; lastX = e.clientX; v = 0; el.setPointerCapture(e.pointerId); el.classList.add('dragging'); };
    const move = (e: PointerEvent) => { if (!drag) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); x += dx; v = dx; };
    const up = () => { if (!drag) return; drag = false; el.classList.remove('dragging'); };
    // a drag shouldn't open the lightbox
    const click = (e: MouseEvent) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [shots.length]);

  if (!shots.length) return null;
  const loop = [...shots, ...shots]; // twice, so it wraps without a seam
  return (
    <div className="gallery" role="region" aria-label="Screens from the project">
      <div className="gallery-track" ref={track}>
        {loop.map((s, i) => (
          <figure key={i} className="gallery-item" aria-hidden={i >= shots.length ? true : undefined}>
            <img className="zoom" src={s.src!} alt={i < shots.length ? s.label ?? '' : ''} draggable={false} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
            {s.label ? <figcaption>{s.label}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
