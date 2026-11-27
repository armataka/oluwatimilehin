'use client';
// The only place the stickers live: a board on the Me page. Pick one up, it lifts and tilts the way you move it.
import { useRef, useState } from 'react';
import { Icon } from './Icon';

type S = { id: string; label: string; svg: string; x: number; y: number; rot: number; w: number };

export function Board({ items }: { items: S[] }) {
  const [cap, setCap] = useState('Drag them around.');
  const z = useRef(10);

  const bind = (el: HTMLDivElement | null, label: string) => {
    if (!el || el.dataset.bound) return; el.dataset.bound = '1';
    let sx = 0, sy = 0, ox = 0, oy = 0, held = false;
    el.addEventListener('pointerdown', (e) => {
      held = true; el.classList.add('held'); el.style.zIndex = String(++z.current); el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.getPropertyValue('--dx')) || 0; oy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
      el.style.setProperty('--s', '1.07'); setCap(label);
    });
    el.addEventListener('pointermove', (e) => {
      if (!held) return;
      el.style.setProperty('--dx', `${ox + e.clientX - sx}px`); el.style.setProperty('--dy', `${oy + e.clientY - sy}px`);
      el.style.setProperty('--tilt', String(Math.max(-12, Math.min(12, e.movementX * 1.5))));
    });
    const up = () => { if (!held) return; held = false; el.classList.remove('held'); el.style.setProperty('--s', '1'); el.style.setProperty('--tilt', '0'); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };

  return (
    <div className="board-wrap" data-r>
      <div className="board" aria-label="A board of stickers. Drag them around." onPointerLeave={() => setCap('Drag them around.')}>
        {items.map((s) => (
          <div key={s.id} className="stick" ref={(el) => bind(el, s.label)} onPointerEnter={() => setCap(s.label)}
            style={{ ['--x' as string]: `${s.x}%`, ['--y' as string]: `${s.y}%`, ['--rot' as string]: `${s.rot}deg`, ['--w' as string]: `${s.w}px` }}
            dangerouslySetInnerHTML={{ __html: s.svg }} />
        ))}
      </div>
      <p className="board-cap s3" aria-live="polite"><Icon name="drag-and-drop" size={14} /><span>{cap}</span></p>
    </div>
  );
}
