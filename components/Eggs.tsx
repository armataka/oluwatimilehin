'use client';
// Things to find. ↑↑↓↓←→←→BA rains coins. Typing 44 sends Lewis's helmet across the screen. The console says hello.
import { useEffect } from 'react';
import { stickers, stickerSvg } from '@/lib/stickers';

export function Eggs() {
  useEffect(() => {
    console.log('%c One Timi %c Hi. If you read consoles, we should talk: timi.odunlami82@outlook.com\n Things to try: the Konami code. Typing 44. Throwing the stickers in the footer on /me.', 'background:#141312;color:#e2b04f;padding:4px 8px;border-radius:4px;font-weight:700', 'color:inherit');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sfx = (n: string) => window.dispatchEvent(new CustomEvent('sfx', { detail: n }));
    const coinSvg = stickerSvg(stickers.find((s) => s.id === 'coin')!), helmet = stickerSvg(stickers.find((s) => s.id === 'helmet')!);
    const rain = () => {
      const box = document.createElement('div'); box.className = 'egg-rain'; box.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < (still ? 6 : 36); i++) {
        const c = document.createElement('span'); c.innerHTML = coinSvg;
        c.style.cssText = `left:${Math.random() * 100}%;width:${22 + Math.random() * 26}px;animation-delay:${Math.random() * 1.2}s;animation-duration:${1.6 + Math.random() * 1.4}s;--r:${(Math.random() - 0.5) * 1440}deg`;
        box.appendChild(c);
        setTimeout(() => sfx('coin'), 300 + i * 90);
      }
      document.body.appendChild(box); setTimeout(() => box.remove(), 4600);
    };
    const race = () => {
      const h = document.createElement('span'); h.className = 'egg-race'; h.setAttribute('aria-hidden', 'true'); h.innerHTML = helmet;
      document.body.appendChild(h); sfx('open'); setTimeout(() => h.remove(), 1900);
    };
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let k = 0, typed = '';
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element)?.closest?.('input, textarea')) return;
      k = e.key === KONAMI[k] ? k + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) { k = 0; rain(); }
      typed = (typed + e.key).slice(-2);
      if (typed === '44') { typed = ''; race(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return null;
}
