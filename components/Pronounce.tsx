'use client';
// After Earvin Fanfair: the pronunciation sits after the name, and each syllable lights up in turn as you point at it
// (or tap it, or focus it and press Enter). Silent for now: the recording is kept (Site details → Name recording)
// for when we work out how sound should come back.
import { useRef, useState } from 'react';

const STEP = 200;   // ms per syllable

export function Pronounce({ say, meaning }: { say: string; meaning: string }) {
  const parts = say.split('-');
  const [on, setOn] = useState(-1);
  const busy = useRef(false);

  const run = () => {
    if (busy.current) return; busy.current = true;
    parts.forEach((_, i) => setTimeout(() => setOn(i), i * STEP));
    setTimeout(() => { setOn(-1); busy.current = false; }, parts.length * STEP + 450);
  };

  return (
    <button type="button" className={`pron${on >= 0 ? ' play' : ''}`} aria-label={`Pronounced ${say}`} title={`Yoruba for “${meaning}”`}
      onClick={run} onPointerEnter={(e) => { if (e.pointerType === 'mouse') run(); }}>
      (pronounced “{parts.map((p, i) => (
        <span key={i}>{i ? <span className="hy">-</span> : null}<span className={`sy${i === on ? ' on' : i < on ? ' done' : ''}`}>{p}</span></span>
      ))}”)
    </button>
  );
}
