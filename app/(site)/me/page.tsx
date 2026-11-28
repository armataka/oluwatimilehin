import type { Metadata } from 'next';
import { getSite, reader } from '@/lib/content';
import { Pronounce } from '@/components/Pronounce';

export const metadata: Metadata = { title: 'Me: Oluwatimilehin Odunlami' };

export default async function Me() {
  const [site, me] = await Promise.all([getSite(), reader.singletons.me.readOrThrow()]);
  return (
    <main className="me">
      <h1 className="t-display" data-r>{site.first}</h1>
      <p className="lede" data-r>is Yoruba for “{site.meaning}”.</p>
      <p data-r className="say-line t-small"><Pronounce say={site.say} meaning={site.meaning} /></p>

      <div className="copy">
        {me.bio.map((p, i) => <p key={i} data-r>{p}</p>)}
      </div>

      <section className="sec" aria-labelledby="pb">
        <h2 id="pb" className="t-heading" data-r>My playbook</h2>
        <ol className="ol">
          {me.playbook.map((p, i) => (
            <li key={i} data-r><span className="t-label">{String(i + 1).padStart(2, '0')}</span><div><p className="t-strong">{p.title}</p><p className="ink-2">{p.text}</p></div></li>
          ))}
        </ol>
      </section>


      <section className="sec" aria-labelledby="rn">
        <h2 id="rn" className="t-heading" data-r>Right now</h2>
        <dl className="kv" data-r>
          {me.rightNow.map((r, i) => (<div key={i}><dt className="t-label">{r.label}</dt><dd>{r.value}</dd></div>))}
          <div><dt className="t-label">Local time</dt><dd>Lagos, <time data-clock className="num" suppressHydrationWarning /> (UTC+1)</dd></div>
          <div><dt className="t-label">Say hello</dt><dd className="links">
            <a className="link" href={`mailto:${site.email}`}>Email</a>
            <a className="link" href={site.linkedin}>LinkedIn</a>
            <a className="link" href={site.resume}>Résumé</a>
          </dd></div>
        </dl>
      </section>
      <section className="sec" aria-labelledby="oc">
        <h2 id="oc" className="t-heading" data-r>Off the clock</h2>
        <p data-r>{me.offTheClock}</p>
      </section>

    </main>
  );
}
