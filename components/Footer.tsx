'use client';
// The page is a sheet lying on a dark bar. At the end of the page, keep scrolling and the sheet lifts with you,
// against a little resistance. Push far enough and let go, and it springs open; not far enough and it settles back.
// Scroll up, press Escape or click the page to close it.
// After Emmanuel Hong's Hidden Footer (emmanuelhong.com/explorations/hidden-footer).
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { Pile } from './Pile';

type Theme = 'auto' | 'light' | 'dark';
declare global { interface Window { __lenis?: { stop(): void; start(): void } } }

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>('auto');
  const [open, setOpenState] = useState(false);
  const [hint, setHint] = useState(false);
  const ctl = useRef<{ setOpen: (o: boolean) => void } | null>(null);
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
    const under = ref.current!;
    const sheet = document.querySelector<HTMLElement>('.sheet')!;
    const root = document.documentElement;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lift = 0, vel = 0, target = 0, isOpen = false, dragging = false, acc = 0;
    let lastWheel = 0, idle = 0, raf = 0;
    const H = () => under.offsetHeight;
    const T = () => Math.max(150, H() * 0.9); // how far past the end you push before letting go opens it
    const atBottom = () => Math.ceil(scrollY + innerHeight) >= root.scrollHeight - 2;

    const paint = () => {
      sheet.style.transform = lift > 0.2 ? `translate3d(0,${(-lift).toFixed(2)}px,0)` : '';
      under.style.setProperty('--p', Math.min(1, lift / H()).toFixed(3));
    };
    const tick = () => {
      raf = 0;
      if (still) { lift = target; paint(); return; }
      if (dragging) { lift += (target - lift) * 0.35; vel = 0; }        // while your fingers are on it: follow, no bounce
      else { vel += (target - lift) * 0.16; vel *= 0.72; lift += vel; } // let go: a spring with a touch of overshoot
      paint();
      if (Math.abs(target - lift) > 0.2 || Math.abs(vel) > 0.2) raf = requestAnimationFrame(tick);
      else { lift = target; paint(); }
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const setOpen = (o: boolean) => {
      dragging = false; acc = 0;
      target = o ? H() : 0; go();
      if (o === isOpen) return;
      isOpen = o; setOpenState(o);
      root.classList.toggle('under-open', o);
      if (o) window.__lenis?.stop(); else window.__lenis?.start();
      setHint(!o && atBottom());
    };
    ctl.current = { setOpen };

    // rubber band: the further you push, the less it gives, and it never passes the footer's height
    const follow = () => { const h = H(); target = h * 0.92 * (1 - Math.exp(-acc / (T() * 1.1))); dragging = true; go(); };
    const release = () => { if (!dragging) return; if (acc >= T()) setOpen(true); else { dragging = false; acc = 0; target = 0; go(); } };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now(), gap = now - lastWheel; lastWheel = now;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (isOpen) { e.preventDefault(); if (dy < -4) setOpen(false); return; }
      if (dy <= 0 || !atBottom()) { if (dragging && dy < 0) release(); return; }
      // the momentum of the scroll that brought you here doesn't count: a new push has to start after a pause
      if (!dragging && gap < 160) return;
      acc += Math.min(dy, 80);
      follow();
      clearTimeout(idle); idle = window.setTimeout(release, 140);
    };
    let ty: number | null = null;
    const onTouchStart = (e: TouchEvent) => { ty = atBottom() || isOpen ? e.touches[0].clientY : null; };
    const onTouchMove = (e: TouchEvent) => {
      if (ty === null) return;
      const dy = ty - e.touches[0].clientY;
      if (isOpen) { if (dy < -30) { setOpen(false); ty = null; } return; }
      if (dy > 0 && atBottom()) { acc = dy * 1.3; follow(); }
    };
    const onTouchEnd = () => { ty = null; release(); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element)?.closest?.('input, textarea')) return;
      if (isOpen && ['Escape', 'ArrowUp', 'PageUp', 'Home'].includes(e.key)) { e.preventDefault(); setOpen(false); return; }
      if (!isOpen && atBottom() && ['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) { e.preventDefault(); setOpen(true); }
    };
    const onSheetClick = (e: MouseEvent) => { if (isOpen) { e.preventDefault(); e.stopPropagation(); setOpen(false); } };
    const onScroll = () => setHint(!isOpen && atBottom());
    const onResize = () => { if (isOpen) { target = H(); go(); } onScroll(); };

    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: true });
    addEventListener('touchend', onTouchEnd);
    addEventListener('keydown', onKey);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    sheet.addEventListener('click', onSheetClick, true);
    const t0 = window.setTimeout(onScroll, 1200);
    return () => {
      removeEventListener('wheel', onWheel); removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove);
      removeEventListener('touchend', onTouchEnd); removeEventListener('keydown', onKey); removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize); sheet.removeEventListener('click', onSheetClick, true);
      clearTimeout(idle); clearTimeout(t0); cancelAnimationFrame(raf);
    };
  }, []);

  const opts: { t: Theme; icon: string; label: string }[] = [
    { t: 'auto', icon: 'monitor', label: 'Match my system' },
    { t: 'light', icon: 'sun', label: 'Light' },
    { t: 'dark', icon: 'moon', label: 'Dark' },
  ];

  return (
    <>
      <button type="button" className={`more${hint ? ' shown' : ''}`} onClick={() => ctl.current?.setOpen(true)} tabIndex={hint ? 0 : -1}>
        There’s more underneath <Icon name="arrow-down" size={14} />
      </button>
      <footer className="under" ref={ref} aria-label="Footer">
        {onMe ? <Pile open={open} /> : null}
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
      </footer>
    </>
  );
}
