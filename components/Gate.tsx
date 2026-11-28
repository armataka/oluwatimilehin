'use client';
// NDA work: after the summary, one field. The password is checked on the server; only then is the rest sent.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';

export function Gate({ slug, sections }: { slug: string; sections: number }) {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [state, setState] = useState<'' | 'busy' | 'err' | 'done' | 'leaving'>('');
  const [msg, setMsg] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || state === 'busy') return;
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/unlock', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw, slug }) });
      if (r.ok) {
        setState('done'); window.dispatchEvent(new CustomEvent('sfx', { detail: 'unlock' }));
        // remember it in this browser for as long as the unlock lasts (30 days): the Locked tags disappear
        try { localStorage.setItem('unlocked', String(Date.now() + 30 * 864e5)); document.documentElement.classList.add('unlocked'); } catch {}
        setTimeout(() => setState('leaving'), 650);
        setTimeout(() => router.refresh(), 1100);
        return;
      }
      setMsg(r.status === 401 ? 'That’s not it. It’s on my résumé.' : 'That didn’t open. Try again in a moment.');
    } catch {
      setMsg('That didn’t open. Try again in a moment.');
    }
    setState('');
    requestAnimationFrame(() => { setState('err'); input.current?.select(); });
  };

  return (
    // the reveal adds a class to the outer element, so the changing state classes live on the inner one
    <section aria-labelledby="g-h" data-r>
      <div className={`gate ${state === 'done' || state === 'leaving' ? 'done' : ''} ${state}`}>
      <p className="g-h" id="g-h"><span className="tag">Locked</span>The rest is under NDA</p>
      <p className="g-sub">{sections} more sections. The password is on my résumé.</p>
      <form className="g-form" onSubmit={submit}>
        <label className="g-field">
          <Icon name="key" size={16} />
          <span className="sr">Password</span>
          <input ref={input} name="password" type="password" placeholder="Password" autoComplete="current-password" spellCheck={false}
            value={pw} onChange={(e) => { setPw(e.target.value); if (state === 'err') setState(''); setMsg(''); }} />
          <button className="btn icon g-go" type="submit" disabled={!pw} aria-label="Unlock">
            <Icon name="arrow-right" size={16} className="i-go" />
            <Icon name="loader" size={16} className="i-load" />
            <Icon name="check" size={16} className="i-ok" />
          </button>
        </label>
        <p className="g-msg" aria-live="polite">{msg}</p>
      </form>
      </div>
    </section>
  );
}
