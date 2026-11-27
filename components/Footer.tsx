'use client';
// The page is a sheet lying on a dark bar. Scroll to the end and the sheet slides up off it, at the speed of your own scroll:
// no thresholds, no snapping. The bar's contents rise and brighten as they're uncovered.
// After Emmanuel Hong's Hidden Footer (emmanuelhong.com/explorations/hidden-footer).
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { Pile } from './Pile';

type Theme = 'auto' | 'light' | 'dark';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>('auto');
  const [shown, setShown] = useState(false);
  const onMe = (usePathname() ?? '').startsWith('/me');

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);

  const choose = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
    try { if (t === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', t); } catch {}
    setTheme(t);
  };

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const h = el.offsetHeight;
      const left = document.documentElement.scrollHeight - (scrollY + innerHeight); // px of page still below the fold
      const p = Math.max(0, Math.min(1, 1 - left / h));
      el.style.setProperty('--p', p.toFixed(3));
      if (p > 0.35) setShown(true);
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    const ro = new ResizeObserver(ask); ro.observe(document.body);
    return () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const opts: { t: Theme; icon: string; label: string }[] = [
    { t: 'auto', icon: 'monitor', label: 'Match my system' },
    { t: 'light', icon: 'sun', label: 'Light' },
    { t: 'dark', icon: 'moon', label: 'Dark' },
  ];

  return (
    <footer className="under" ref={ref} aria-label="Footer">
      <div className="under-in">
        <p className="np"><span className="note-ic"><Icon name="music" size={16} /></span><span>Nothing playing</span><span className="dim">Spotify connects at launch</span></p>
        <div className="theme" role="radiogroup" aria-label="Theme">
          {opts.map((o) => (
            <button key={o.t} type="button" role="radio" aria-checked={theme === o.t} aria-label={o.label} onClick={() => choose(o.t)}>
              <Icon name={o.icon} size={16} />
            </button>
          ))}
        </div>
        <p className="bar-meta">
          <span className="fi"><Icon name="clock" size={14} />Lagos <time data-clock suppressHydrationWarning /></span>
          <a className="fi" href="https://www.emmanuelhong.com/explorations/hidden-footer">Footer after Emmanuel Hong<Icon name="external-link" size={13} /></a>
        </p>
      </div>
      {onMe ? <Pile open={shown} /> : null}
    </footer>
  );
}
