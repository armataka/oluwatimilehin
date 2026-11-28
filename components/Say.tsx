'use client';
// The name, dot-underlined. Point at it (or tap it, or tab to it) and a bubble rises above it with the name
// broken into syllables, each lighting up in turn as it would be said.
import { useRef, useState } from 'react';

const STEP = 200;   // ms per syllable

export function Say({ name, say, meaning }: { name: string; say: string; meaning: string }) {
  const parts = say.split('-');
  const [on, setOn] = useState(-1);
  const [open, setOpen] = useState(false);
  const busy = useRef(false);

  const run = () => {
    if (busy.current) return; busy.current = true;
    parts.forEach((_, i) => setTimeout(() => setOn(i), 120 + i * STEP));
    setTimeout(() => { setOn(-1); busy.current = false; }, 120 + parts.length * STEP + 600);
  };
  const show = () => { setOpen(true); run(); };

  return (
    <span className={`say${open ? ' open' : ''}`}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}>
      <button type="button" className="say-name" aria-label={`${name}, said ${say}, Yoruba for “${meaning}”`}
        onFocus={show} onBlur={() => setOpen(false)} onClick={() => { setOpen(true); run(); }}>{name}</button>
      <span className="tip" aria-hidden="true">
        {parts.map((p, i) => (
          <span key={i}>{i ? <span className="hy">-</span> : null}<span className={`sy${i === on ? ' on' : i < on ? ' done' : ''}`}>{p}</span></span>
        ))}
      </span>
    </span>
  );
}
