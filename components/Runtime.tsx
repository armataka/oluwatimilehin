'use client';
// Page-wide behaviour: smooth scrolling, the blur-in reveal, the Lagos clock (on Me), the image lightbox and the loader (on arrival and on every reload).
import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window { __lenis?: Lenis }
}

export function Runtime() {
  useEffect(() => {
    const root = document.documentElement;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const off: (() => void)[] = [];

    // smooth scroll on desktop
    if (!still && fine) {
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, autoRaf: true });
      window.__lenis = lenis;
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element).closest('a[href^="#"]'); if (!a) return;
        const el = document.querySelector(a.getAttribute('href')!); if (!el) return;
        e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -40, duration: 1.2, easing: (x) => 1 - Math.pow(1 - x, 4) });
      };
      document.addEventListener('click', onClick);
      off.push(() => { document.removeEventListener('click', onClick); lenis.destroy(); delete window.__lenis; });
    }

    // reveal: things arrive out of a soft blur, top to bottom
    const SEL = '[data-r]:not(.in), .prose > :not(.in)';
    let queue: Element[] = [], flushing = false;
    const flush = () => {
      flushing = false;
      queue.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((el, i) => { (el as HTMLElement).style.setProperty('--d', `${Math.min(i, 8) * 70}ms`); el.classList.add('in'); });
      queue = [];
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { queue.push(en.target); io.unobserve(en.target); } });
      if (queue.length && !flushing) { flushing = true; requestAnimationFrame(flush); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    const watch = () => document.querySelectorAll(SEL).forEach((el) => io.observe(el));
    const loading = root.classList.contains('loading');
    let started = false;
    const start = () => { started = true; watch(); };
    if (loading) {
      const t = setTimeout(() => root.classList.remove('loading'), 2800);
      off.push(() => clearTimeout(t));
    }
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 500))]);
    fonts.then(() => setTimeout(start, loading ? 2150 : 0));
    // new content (an unlocked case study) reveals the same way
    const mo = new MutationObserver(() => { if (started) watch(); });
    mo.observe(document.querySelector('.frame')!, { childList: true, subtree: true });
    off.push(() => { io.disconnect(); mo.disconnect(); });

    // Lagos clock
    const tf = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => { const t = tf.format(new Date()); document.querySelectorAll('[data-clock]').forEach((c) => { c.textContent = t; }); };
    tick(); const iv = setInterval(tick, 15000); off.push(() => clearInterval(iv));

    // lightbox
    const lb = document.getElementById('lb')!, lbImg = document.getElementById('lb-img') as HTMLImageElement;
    const close = () => { lb.classList.remove('open'); window.__lenis?.start(); };
    const onZoom = (e: MouseEvent) => {
      const t = (e.target as Element).closest('img.zoom') as HTMLImageElement | null;
      if (t) { lbImg.src = t.dataset.full || t.src; lbImg.alt = t.alt; lb.classList.add('open'); window.__lenis?.stop(); return; }
      if (lb.classList.contains('open')) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); };
    document.addEventListener('click', onZoom); addEventListener('keydown', onKey);
    off.push(() => { document.removeEventListener('click', onZoom); removeEventListener('keydown', onKey); });

    return () => off.forEach((f) => f());
  }, []);
  return null;
}
