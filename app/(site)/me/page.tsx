import type { Metadata } from 'next';
import { getSite, reader } from '@/lib/content';
import { Pronounce } from '@/components/Pronounce';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Me: Oluwatimilehin Odunlami' };

export default async function Me() {
  const [site, me] = await Promise.all([getSite(), reader.singletons.me.readOrThrow()]);
  return (
    <main className="me">
      <h1 data-r><span className="w5">{site.first}</span> <span className="s3">is Yoruba for “{site.meaning}”.</span></h1>
      <p data-r className="say-line s3"><Pronounce say={site.say} meaning={site.meaning} /></p>

      <div className="prose-me">
        {me.bio.map((p, i) => <p key={i} data-r className={i ? 's2' : undefined}>{p}</p>)}
      </div>

      <section aria-labelledby="pb">
        <h2 id="pb" className="lbl s3" data-r>My playbook</h2>
        <ol className="plays">
          {me.playbook.map((p, i) => (
            <li key={i} data-r><span className="no">{String(i + 1).padStart(2, '0')}</span><div><p className="w5">{p.title}</p><p className="s2">{p.text}</p></div></li>
          ))}
        </ol>
      </section>


      <section className="now" aria-labelledby="rn">
        <h2 id="rn" className="lbl s3" data-r>Right now</h2>
        <dl className="kv" data-r>
          {me.rightNow.map((r, i) => (<div key={i}><dt className="s3">{r.label}</dt><dd>{r.value}</dd></div>))}
          <div><dt className="s3">Local time</dt><dd className="ic"><Icon name="clock" size={14} />Lagos, <time data-clock className="num" suppressHydrationWarning /> (UTC+1)</dd></div>
          <div><dt className="s3">Say hello</dt><dd className="hello">
            <a className="ic" href={`mailto:${site.email}`}><Icon name="mail" size={14} /><span className="u">Email</span></a>
            <a className="ic" href={site.linkedin}><Icon name="linkedin" size={14} /><span className="u">LinkedIn</span></a>
            <a className="ic" href={site.resume}><Icon name="file-text" size={14} /><span className="u">Résumé</span></a>
          </dd></div>
        </dl>
      </section>
      <section aria-labelledby="oc">
        <h2 id="oc" className="lbl s3" data-r>Off the clock</h2>
        <p data-r className="s2">{me.offTheClock}</p>
      </section>

    </main>
  );
}
