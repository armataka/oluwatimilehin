'use client';
// The page is a sheet lying on a dark bar. The gesture is Emmanuel Hong's Hidden Footer
// (emmanuelhong.com/explorations/hidden-footer), exactly: at the end of the page, wheel movement adds up and
// resets after 180ms of stillness. Past 32px down, the sheet lifts and the bar rises into view; past 32px up,
// it closes. A swipe of more than 32px does the same on touch, and so do the arrow keys. Both move over 300ms.
// Escape or a click on the page also closes it.
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { Pile } from './Pile';
import { play, soundOn, setSound as saveSound } from './Sound';

type Theme = 'auto' | 'light' | 'dark';

export function Footer({ name }: { name: string }) {
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
  useEffect(() => {
    setSound(soundOn());
    const on = (e: Event) => setSound(!!(e as CustomEvent).detail);
    addEventListener('soundchange', on); return () => removeEventListener('soundchange', on);
  }, []);
  const toggleSound = () => { const n = !sound; saveSound(n); if (n) play('press'); };
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
    const lenis = () => (window as unknown as { __lenis?: { targetScroll: number; limit: number } }).__lenis;
    const STEP = 32, IDLE = 180, MS = 300;

    let isOpen = false, wheel = 0, idle = 0, peeked = false;
    // at the end of the page (with smooth scrolling, where the scroll is heading), or a page too short to scroll
    const atBottom = () => {
      const l = lenis();
      if (l) return l.targetScroll >= l.limit - 1;
      return Math.ceil(scrollY + innerHeight) >= root.scrollHeight - 2;
    };
    const paint = (o: boolean) => {
      // Emmanuel's timing: 300ms; the sheet eases out as it lifts and in-out as it comes back; the bar eases out in, eases in out
      const ease = o ? 'cubic-bezier(0, 0, .2, 1)' : 'cubic-bezier(.4, 0, .2, 1)';
      sheet.style.transition = `transform ${MS}ms ${ease}, border-radius ${MS}ms ${ease}`;
      sheet.style.transform = o ? `translate3d(0, ${-(under.offsetHeight - 25)}px, 0)` : '';   // the bar's height (the footer reaches 25px further up, behind the corners)
      sheet.style.borderRadius = o ? '0 0 24.5px 24.5px' : '';
      under.style.setProperty('--f-ease', o ? 'cubic-bezier(0, 0, .2, 1)' : 'cubic-bezier(.4, 0, 1, 1)');
      under.style.setProperty('--p', o ? '1' : '0');
    };
    const setOpen = (o: boolean) => {
      wheel = 0;
      if (o === isOpen) return;
      isOpen = o; setOpenState(o); play(o ? 'open' : 'close');
      if (o && !peeked) { peeked = true; setPeek(true); }
      root.classList.toggle('under-open', o);
      paint(o);
      setHint(!o && atBottom());
    };
    ctl.current = { setOpen };

    let swallow = false;   // after a close, the rest of that same scroll is eaten, so the page doesn't move
    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      const eat = () => { e.preventDefault(); e.stopImmediatePropagation(); clearTimeout(idle); idle = window.setTimeout(() => { wheel = 0; swallow = false; }, IDLE); };
      if (swallow) { eat(); return; }
      // until the page is at its end, the wheel scrolls the page; after that, it adds up toward the footer
      if (!isOpen && !atBottom()) { wheel = 0; return; }
      if (!isOpen && dy < 0) { wheel = 0; return; }   // scrolling back up the page
      eat();                                          // the smooth scroller never sees it
      wheel += dy;
      if (wheel > STEP) setOpen(true);
      else if (wheel < -STEP) { setOpen(false); swallow = true; }
    };
    let ty: number | null = null;
    const onTouchStart = (e: TouchEvent) => { ty = atBottom() || isOpen ? e.touches[0].clientY : null; };
    const onTouchEnd = (e: TouchEvent) => {
      if (ty === null) return;
      const d = ty - (e.changedTouches[0]?.clientY ?? ty); ty = null;
      if (Math.abs(d) > STEP) setOpen(d > 0);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element)?.closest?.('input, textarea')) return;
      if (isOpen && ['Escape', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setOpen(false); return; }
      if (!isOpen && atBottom() && e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); }
    };
    const onSheetClick = (e: MouseEvent) => { if (isOpen) { e.preventDefault(); e.stopPropagation(); setOpen(false); } };
    const onScroll = () => setHint(!isOpen && atBottom());
    const onResize = () => { if (isOpen) paint(true); onScroll(); };

    addEventListener('wheel', onWheel, { passive: false, capture: true });   // ahead of the smooth scroller
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchend', onTouchEnd);
    addEventListener('keydown', onKey);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    sheet.addEventListener('click', onSheetClick, true);
    const t0 = window.setTimeout(onScroll, 1200);
    return () => {
      removeEventListener('wheel', onWheel, { capture: true }); removeEventListener('touchstart', onTouchStart); removeEventListener('touchend', onTouchEnd);
      removeEventListener('keydown', onKey); removeEventListener('scroll', onScroll); removeEventListener('resize', onResize);
      sheet.removeEventListener('click', onSheetClick, true);
      clearTimeout(idle); clearTimeout(t0);
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
        <span>There’s more underneath</span> <Icon name="arrow-down" size={14} />
      </button>
      <footer className="under" ref={ref} aria-label="Footer">
        {onMe ? <Pile peek={peekd} open={open} /> : null}
        <div className="under-in">
          <p className="bar-meta"><span>© {name} <span suppressHydrationWarning>{new Date().getFullYear()}</span></span></p>
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
          <p className={`np${np?.playing ? ' live' : ''}`}><span className="note-ic"><Icon name="music" size={16} /></span>
            {np?.title ? (
              <><span>{np.playing ? 'Listening to' : 'Last played'}</span>{np.url ? <a href={np.url} className="dim"><span>{np.title}<span className="by">{np.artist}</span></span></a> : <span className="dim">{np.title}<span className="by">{np.artist}</span></span>}</>
            ) : <span>Nothing playing</span>}
          </p>
        </div>
      </footer>
    </>
  );
}
