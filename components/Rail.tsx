'use client';
// Ticks beside the column, one per section; the name slides out on hover. Also fills the audit stepper as you read down it.
// After Jesper Vos.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function Rail() {
  const ref = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  // lives on <body>, so it stays put when the page lifts off the footer
  useEffect(() => setHost(document.body), []);
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const prose = document.getElementById('prose');
    if (!prose) return;
    const secs = () => [...prose.querySelectorAll('h2')] as HTMLElement[];
    const build = () => {
      rail.innerHTML = '';
      secs().forEach((s, i) => {
        const t = s.textContent?.trim() ?? '';
        s.id = s.id || `s-${i + 1}`;
        const a = document.createElement('a');
        a.href = `#${s.id}`; a.setAttribute('aria-label', t); a.innerHTML = '<i></i><span></span>';
        (a.lastChild as HTMLElement).textContent = t;
        rail.appendChild(a);
      });
      mark();
    };
    const mark = () => {
      let k = -1; secs().forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.35) k = i; });
      [...rail.children].forEach((a, i) => a.classList.toggle('on', i === k));
      // step out of the way while a full-width gallery passes behind it
      const rr = rail.getBoundingClientRect();
      const under = [...document.querySelectorAll('.gallery')].some((g) => { const b = g.getBoundingClientRect(); return b.bottom > rr.top - 20 && b.top < rr.bottom + 20; });
      rail.parentElement?.classList.toggle('dim', under);
    };
    const fill = () => document.querySelectorAll<HTMLElement>('.steps').forEach((ol) => {
      const r = ol.getBoundingClientRect(), y = innerHeight * 0.55;
      // the line runs from the first step's circle to the last one's, not past them
      const dots = ol.querySelectorAll<HTMLElement>('.dot');
      if (!dots.length) return;
      const a = dots[0].getBoundingClientRect(), b = dots[dots.length - 1].getBoundingClientRect();
      const l0 = a.top + a.height / 2 - r.top, l1 = r.bottom - (b.top + b.height / 2);
      ol.style.setProperty('--l0', `${l0.toFixed(1)}px`); ol.style.setProperty('--l1', `${l1.toFixed(1)}px`);
      const span = r.height - l0 - l1;
      // the line and the dots only ever move forward: once you've reached a step it stays filled
      const p = Math.max(0, Math.min(1, (y - r.top - l0) / span)), was = +(ol.style.getPropertyValue('--p') || 0);
      ol.style.setProperty('--p', Math.max(p, was).toFixed(3));
      ol.querySelectorAll('.st').forEach((st) => { if (st.getBoundingClientRect().top + 14 < y) st.classList.add('on'); });
    });
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; mark(); fill(); }); };
    addEventListener('scroll', onScroll, { passive: true });
    const mo = new MutationObserver(() => { build(); fill(); });
    mo.observe(prose, { childList: true });
    build(); fill();
    return () => { removeEventListener('scroll', onScroll); mo.disconnect(); };
  }, [host]);
  if (!host) return null;
  return createPortal(<nav className="rail" aria-label="On this page"><div id="rail" ref={ref} /></nav>, host);
}
