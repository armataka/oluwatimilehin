'use client';
// Ticks beside the column, one per section; the name slides out on hover. Also fills the audit stepper as you read down it.
// After Jesper Vos.
import { useEffect, useRef } from 'react';

export function Rail() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = ref.current!;
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
    };
    const fill = () => document.querySelectorAll<HTMLElement>('.steps').forEach((ol) => {
      const r = ol.getBoundingClientRect(), y = innerHeight * 0.55;
      ol.style.setProperty('--p', Math.max(0, Math.min(1, (y - r.top) / r.height)).toFixed(3));
      ol.querySelectorAll('.st').forEach((st) => st.classList.toggle('on', st.getBoundingClientRect().top + 14 < y));
    });
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; mark(); fill(); }); };
    addEventListener('scroll', onScroll, { passive: true });
    const mo = new MutationObserver(() => { build(); fill(); });
    mo.observe(prose, { childList: true });
    build(); fill();
    return () => { removeEventListener('scroll', onScroll); mo.disconnect(); };
  }, []);
  return <nav className="rail" aria-label="On this page"><div id="rail" ref={ref} /></nav>;
}
