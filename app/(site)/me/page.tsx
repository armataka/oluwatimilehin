import type { Metadata } from 'next';
import { getSite, reader } from '@/lib/content';
import { Pronounce } from '@/components/Pronounce';
import { Icon } from '@/components/Icon';
import { Board } from '@/components/Board';
import { stickers, stickerSvg } from '@/lib/stickers';

export const metadata: Metadata = { title: 'Me: Oluwatimilehin Odunlami' };

// where each sticker sits on the board: x%, y%, rotation
const place: Record<string, [number, number, number]> = { ticket: [6, 14, -6], helmet: [38, 6, 5], football: [70, 10, -8], basketball: [84, 52, 6], pick: [30, 58, -14], pow: [52, 46, 4], baseball: [12, 62, 10], gridiron: [64, 66, -10], tennis: [90, 14, 12], badge: [2, 40, -4], sheet: [44, 20, -3] };

export default async function Me() {
  const [site, me] = await Promise.all([getSite(), reader.singletons.me.readOrThrow()]);
  const items = (stickers as { id: string; label: string; r: number; w?: number }[]).map((s) => {
    const [x, y, rot] = place[s.id] ?? [50, 50, 0];
    return { id: s.id, label: s.label, svg: stickerSvg(s), x, y, rot, w: (s.w ?? 1) * s.r * 2.3 };
  });
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

      <section aria-labelledby="oc">
        <h2 id="oc" className="lbl s3" data-r>Off the clock</h2>
        <p data-r className="s2">{me.offTheClock}</p>
      </section>

      <Board items={items} />

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
    </main>
  );
}
