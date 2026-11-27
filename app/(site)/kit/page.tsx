import type { Metadata } from 'next';
import { getSite, reader } from '@/lib/content';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Kit: what this site is made of' };

export default async function Kit() {
  const [site, kit] = await Promise.all([getSite(), reader.singletons.kit.readOrThrow()]);
  const t = kit.thanks;
  return (
    <main className="kit">
      <h1 data-r><span className="w5">Kit</span> <span className="s3">What this site is made of, and who it borrows from.</span></h1>
      <dl className="kv" data-r>
        {kit.rows.map((r, i) => (<div key={i}><dt className="s3">{r.label}</dt><dd>{r.value}</dd></div>))}
        <div><dt className="s3">Updated</dt><dd>{site.updated}</dd></div>
      </dl>
      <h2 className="lbl s3" data-r>After</h2>
      <dl className="kv" data-r>
        {kit.credits.map((c, i) => (<div key={i}><dt className="s3">{c.label}</dt><dd><a className="ic" href={c.url ?? '#'}><span className="u">{c.name}</span><Icon name="external-link" size={13} /></a></dd></div>))}
      </dl>
      <h2 className="lbl s3" data-r>With thanks</h2>
      <p data-r className="s2">For restraint, and for what makes a small site sing:{' '}
        {t.map((n, i) => (<span key={i}><a className="u" href={n.url ?? '#'}>{n.name}</a>{i < t.length - 2 ? ', ' : i === t.length - 2 ? ' and ' : '.'}</span>))}
      </p>
    </main>
  );
}
