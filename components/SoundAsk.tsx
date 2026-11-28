'use client';
// First visit only: once the page has loaded, a pill just under the header asks whether to turn sound on (after Noel, nemaas.com).
// "Turn on" answers the way the password field does when it opens: the chime, the button turns to a tick,
// then the pill lifts away. "Not now" just lets it go. Either answer is remembered; the footer switch changes it later.
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { play, setSound } from './Sound';

export function SoundAsk() {
  const [state, setState] = useState<'' | 'show' | 'done' | 'leaving'>('');

  useEffect(() => {
    let asked = false;
    try { asked = localStorage.getItem('sound') !== null; } catch { asked = true; }
    if (asked) return;
    // after the loader, if it's playing
    const t = setTimeout(() => setState('show'), document.documentElement.classList.contains('loading') ? 3100 : 900);
    return () => clearTimeout(t);
  }, []);

  if (!state) return null;
  const leave = (after: number) => { setTimeout(() => setState('leaving'), after); setTimeout(() => setState(''), after + 500); };
  const yes = () => { if (state !== 'show') return; setSound(true); play('unlock'); setState('done'); leave(650); };
  const no = () => { if (state !== 'show') return; setSound(false); leave(0); };

  return (
    <div className={`ask ${state}`} role="dialog" aria-label="Sound" aria-live="polite">
      <p>Do you want to turn on sound?</p>
      <button type="button" className="btn ghost" onClick={no}>Not now</button>
      <button type="button" className="btn" onClick={yes} aria-label="Turn on">
        <span className="i-go">Turn on</span>
        <Icon name="check" size={14} className="i-ok" />
      </button>
    </div>
  );
}
