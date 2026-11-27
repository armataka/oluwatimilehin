'use client';
// After Earvin Fanfair: the pronunciation sits after the name, in grey. The first hover, or a click, plays it.
// Until the recording exists, the syllables fill in like karaoke at speaking pace.
import { useRef, useState } from 'react';
import { Icon } from './Icon';

export function Pronounce({ say, meaning, audio }: { say: string; meaning: string; audio?: string }) {
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(1.5);
  const heard = useRef(false);
  const busy = useRef(false);
  const snd = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    if (busy.current) return; busy.current = true; heard.current = true;
    if (audio && !snd.current) snd.current = new Audio(audio);
    const d = snd.current && isFinite(snd.current.duration) ? snd.current.duration : 1.5;
    setDur(d);
    if (snd.current) { snd.current.currentTime = 0; snd.current.play().catch(() => {}); }
    requestAnimationFrame(() => setPlaying(true));
    setTimeout(() => { setPlaying(false); busy.current = false; }, d * 1000 + 700);
  };

  return (
    <button
      type="button"
      className={`pron${playing ? ' play' : ''}`}
      style={{ ['--say' as string]: playing ? `${dur}s` : '0s' }}
      aria-label={`Pronounced ${say}. Play it.`}
      title={`Yoruba for “${meaning}”`}
      onClick={play}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !heard.current) play(); }}
    >
      (pronounced “<span className="k">{say}</span>”)<Icon name="volume-2" size={14} className="spk" />
    </button>
  );
}
