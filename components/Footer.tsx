'use client';
// The page is a sheet lying on a dark bar. At the end of the page, keep scrolling and the sheet lifts with you,
// against a little resistance. Push past the line and it springs open; stop short and it settles back.
// Scroll up, press Escape or click the page to close it.
// After Emmanuel Hong's Hidden Footer (emmanuelhong.com/explorations/hidden-footer).
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { Pile } from './Pile';
import { play, soundOn } from './Sound';

type Theme = 'auto' | 'light' | 'dark';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>('auto');
  const [open, setOpenState] = useState(false);
  const [hint, setHint] = useState(false);
  const [peekd, setPeek] = useState(false);
  const [np, setNp] = useState<{ playing: boolean; title?: string; artist?: string; url?: string | null } | null>(null);
  useEffect(() => {
    const load = () => fetch('/api/now-playing').then((r) => r.json()).then(setNp).catch(() => {});
    load(); const iv = setInterval(load, 60000); return () => clearInterval(iv);
  }, []);
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundOn()), []);
  const toggleSound = () => { const n = !sound; try { localStorage.setItem('sound', n ? 'on' : 'off'); } catch {} setSound(n); if (n) play('press'); };
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
    const lenis = () => (window as unknown as { __lenis?: { targetScroll: number; limit: number } }).__lenis;

    let lift = 0, vel = 0, target = 0, isOpen = false, dragging = false, acc = 0, peeked = false;
    let lastWheel = 0, lastDy = 0, idle = 0, raf = 0, ignoreUntil = 0, fromEnd = false;
    const H = () => under.offsetHeight;
    const T = () => Math.max(110, H() * 0.75); // how far past the end you push before it opens
    // at the end of the page; with smooth scrolling, count from where the scroll is heading, so a push registers at once
    const atBottom = () => {
      const l = lenis();
      if (l) return l.targetScroll >= l.limit - 1;
      return Math.ceil(scrollY + innerHeight) >= root.scrollHeight - 2;
    };
    // rubber band: gives freely at first, then stiffens, and never passes the footer's height
    const band = (a: number) => H() * 0.94 * (1 - Math.exp(-a / (T() * 1.15)));

    const paint = () => {
      sheet.style.transform = lift > 0.2 ? `translate3d(0,${(-lift).toFixed(2)}px,0)` : '';
      under.style.setProperty('--p', Math.min(1, lift / H()).toFixed(3));
    };
    const tick = () => {
      raf = 0;
      if (still || dragging) { lift = target; vel = 0; paint(); return; } // under your fingers it moves exactly with you
      vel += (target - lift) * 0.13; vel *= 0.76; lift += vel; paint();
      if (Math.abs(target - lift) > 0.2 || Math.abs(vel) > 0.2) raf = requestAnimationFrame(tick);
      else { lift = target; paint(); }
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const peek = () => { if (!peeked) { peeked = true; setPeek(true); } };
    const setOpen = (o: boolean) => {
      dragging = false; acc = 0; clearTimeout(idle);
      target = o ? H() : 0; go();
      if (o === isOpen) return;
      isOpen = o; setOpenState(o); play(o ? 'open' : 'close');
      root.classList.toggle('under-open', o);
      ignoreUntil = performance.now() + 450; // swallow the rest of the push that opened or closed it
      setHint(!o && atBottom());
    };
    ctl.current = { setOpen };

    const push = (a: number) => {
      acc = a; dragging = true; peek();
      if (acc >= T()) { setOpen(true); return; } // past the line: open now, don't wait for you to let go
      target = band(acc); go();
    };
    const settle = () => { if (dragging) { dragging = false; acc = 0; target = 0; go(); } };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now(), gap = now - lastWheel; lastWheel = now;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      const decaying = gap < 60 && Math.abs(dy) < Math.abs(lastDy) * 0.97; // trackpad momentum: each event smaller than the last
      lastDy = dy;
      // a new gesture starts after a short pause; only one that starts at the end of the page can lift it,
      // so flicking your way down to the end never opens the footer by accident
      if (gap > 120) fromEnd = atBottom();
      if (now < ignoreUntil) { if (isOpen && dy > 0) e.preventDefault(); return; }
      if (isOpen) { if (dy < -3) setOpen(false); else e.preventDefault(); return; }
      if (dy <= 0 || !atBottom()) { settle(); return; }
      if (!fromEnd) return;
      if (!dragging && decaying) return;          // coasting doesn't open it; a deliberate push does
      if (dragging && decaying) { clearTimeout(idle); idle = window.setTimeout(settle, 60); return; } // you've let go: it settles back
      push(acc + Math.min(dy, 60));
      clearTimeout(idle); idle = window.setTimeout(settle, 120);
    };
    let ty: number | null = null;
    const onTouchStart = (e: TouchEvent) => { ty = atBottom() || isOpen ? e.touches[0].clientY : null; };
    const onTouchMove = (e: TouchEvent) => {
      if (ty === null) return;
      const dy = ty - e.touches[0].clientY;
      if (isOpen) { if (dy < -24) { setOpen(false); ty = null; } return; }
      if (dy > 0 && atBottom()) push(dy * 1.2);
    };
    const onTouchEnd = () => { ty = null; settle(); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element)?.closest?.('input, textarea')) return;
      if (isOpen && ['Escape', 'ArrowUp', 'PageUp', 'Home'].includes(e.key)) { e.preventDefault(); setOpen(false); return; }
      if (!isOpen && atBottom() && ['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) { e.preventDefault(); peek(); setOpen(true); }
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
        {onMe ? <Pile peek={peekd} open={open} /> : null}
        <div className="under-in">
          <p className={`np${np?.playing ? ' live' : ''}`}><span className="note-ic"><Icon name="music" size={16} /></span>
            {np?.title ? (
              <><span>{np.playing ? 'Listening to' : 'Last played'}</span>{np.url ? <a href={np.url} className="dim">{np.title} · {np.artist}</a> : <span className="dim">{np.title} · {np.artist}</span>}</>
            ) : <span>Nothing playing</span>}
          </p>
          <div className="ctrls">
        <button type="button" className="snd" aria-pressed={sound} aria-label={sound ? 'Sound on. Turn it off' : 'Sound off. Turn it on'} onClick={toggleSound}>
          <Icon name={sound ? 'volume-2' : 'volume-x'} size={16} />
        </button>
        <div className="theme" role="radiogroup" aria-label="Theme">
            {opts.map((o) => (
              <button key={o.t} type="button" role="radio" aria-checked={theme === o.t} aria-label={o.label} onClick={() => choose(o.t)}>
                <Icon name={o.icon} size={16} />
              </button>
            ))}
          </div>
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
