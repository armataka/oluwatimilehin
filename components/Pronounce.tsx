'use client';
// After Earvin Fanfair: the pronunciation sits after the name. The first hover plays it; so does a tap, a click or Enter.
// Each syllable lights up as it's said. With a recording (Site details → Name recording) you hear my voice; until
// then you hear the name's melody: Yoruba is tonal, so each syllable is hummed at its tone (mid, high or low).
import { useRef, useState } from 'react';
import { Icon } from './Icon';
import { note } from './Sound';

// O-lú-wa-tì-mí-lẹ́-hìn: mid, high, mid, low, high, high, low
const TONES = [196, 247, 196, 165, 247, 247, 165];

export function Pronounce({ say, meaning, audio }: { say: string; meaning: string; audio?: string | null }) {
  const parts = say.split('-');
  const [on, setOn] = useState(-1);
  const heard = useRef(false), busy = useRef(false), snd = useRef<HTMLAudioElement | null>(null);

  const warm = () => { if (audio && !snd.current) { snd.current = new Audio(audio); snd.current.preload = 'auto'; snd.current.load(); } };
  const play = () => {
    if (busy.current) return; busy.current = true; heard.current = true;
    if (audio && !snd.current) { snd.current = new Audio(audio); snd.current.preload = 'auto'; }
    const total = snd.current && isFinite(snd.current.duration) && snd.current.duration > 0 ? snd.current.duration * 1000 : audio ? 2100 : parts.length * 185;
    const each = total / parts.length;
    if (snd.current) { snd.current.currentTime = 0; snd.current.play().catch(() => {}); }
    parts.forEach((_, i) => setTimeout(() => { setOn(i); if (!snd.current) note(TONES[i % TONES.length], each / 1000 + 0.08); }, i * each));
    setTimeout(() => { setOn(-1); busy.current = false; }, total + 500);
  };

  return (
    <button type="button" className={`pron${on >= 0 ? ' play' : ''}`} aria-label={`Pronounced ${say}. Play it.`} title={`Yoruba for “${meaning}”. Click to hear it.`}
      onFocus={warm} onPointerMove={warm} onClick={play} onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !heard.current) play(); }}>
      (pronounced “{parts.map((p, i) => (
        <span key={i}>{i ? <span className="hy">-</span> : null}<span className={`sy${i === on ? ' on' : i < on ? ' done' : ''}`}>{p}</span></span>
      ))}”)<Icon name="volume-2" size={14} className="spk" />
    </button>
  );
}
