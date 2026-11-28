'use client';
// One frame that cycles through a project's screens on a loop, with ticks showing where it is. Hover to hold a screen; click to enlarge.
import { useEffect, useState } from 'react';

type Item = { src?: string | null; label?: string };

export function Loop({ items = [] }: { items: Item[] }) {
  const shots = items.filter((i) => i.src);
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold || shots.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % shots.length), 2800);
    return () => clearTimeout(t);
  }, [i, hold, shots.length]);
  if (!shots.length) return null;
  return (
    <figure className="loop" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
      <div className="loop-stage">
        {shots.map((s, k) => <img key={k} className={`zoom${k === i ? ' on' : ''}`} src={s.src!} alt={s.label ?? ''} loading={k ? 'lazy' : 'eager'} decoding="async" />)}
      </div>
      <figcaption>
        <span className="loop-ticks">{shots.map((s, k) => <button key={k} type="button" className={k === i ? 'on' : ''} aria-label={`Show: ${s.label ?? `screen ${k + 1}`}`} onClick={() => setI(k)}><i key={k === i && !hold ? `r${i}` : 'p'} /></button>)}</span>
        <span className="loop-cap"><span>{String(i + 1).padStart(2, '0')}</span><span>{shots[i].label}</span></span>
      </figcaption>
    </figure>
  );
}
