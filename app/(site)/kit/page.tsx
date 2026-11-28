import type { Metadata } from 'next';
import { getSite, reader } from '@/lib/content';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Kit: what this site is made of' };

export default async function Kit() {
  const [site, kit] = await Promise.all([getSite(), reader.singletons.kit.readOrThrow()]);
  return (
    <main className="kit">
      <h1 className="t-display" data-r>Kit</h1>
      <p className="lede" data-r>What this site is made of, and who it borrows from.</p>
      <dl className="kv" data-r>
        {kit.rows.map((r, i) => (<div key={i}><dt className="t-label">{r.label}</dt><dd>{r.value}</dd></div>))}
        <div><dt className="t-label">Updated</dt><dd>{site.updated}</dd></div>
      </dl>
      <h2 className="t-heading" data-r>After</h2>
      <dl className="kv" data-r>
        {kit.credits.map((c, i) => (<div key={i}><dt className="t-label">{c.label}</dt><dd><a className="link-go" href={c.url ?? '#'}><span>{c.name}</span><Icon name="external-link" size={13} /></a></dd></div>))}
      </dl>
    </main>
  );
}
