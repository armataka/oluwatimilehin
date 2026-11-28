import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getProjects, getBody, splitBody } from '@/lib/content';
import { COOKIE, token } from '@/lib/nda';
import { Prose } from '@/components/Prose';
import { Thumb } from '@/components/Thumb';
import { Rail } from '@/components/Rail';
import { Gate } from '@/components/Gate';

type Props = { params: Promise<{ slug: string }> };

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// "Built; rolls out next audit cycle" -> a chip for the state, then the detail (as its own sentence)
function Status({ value }: { value: string }) {
  const [state, ...rest] = value.split(/;\s*/);
  const kind = /live|shipped|launched/i.test(state) ? 'live' : /built|ready|done/i.test(state) ? 'built' : /progress|build|design/i.test(state) ? 'wip' : 'past';
  return (
    <>
      <span className={`chip ${kind}`}><i aria-hidden="true" />{state}</span>
      {rest.length ? <span className="chip-note">{cap(rest.join('; '))}</span> : null}
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects()).find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.name}: ${p.headline}`, description: splitBody(await getBody(slug)).description };
}

export default async function Project({ params }: Props) {
  const { slug } = await params;
  const all = await getProjects();
  const i = all.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = all[i];
  const prev = i > 0 ? all[i - 1] : null;
  const next = i < all.length - 1 ? all[i + 1] : null;

  const t = token();
  const open = !p.locked || (!!t && (await cookies()).get(COOKIE)?.value === t);
  // the case study is split at its password line; when locked, only the part above it (and a count of what's below) leaves the server
  const { pub, priv, sections } = splitBody(await getBody(slug));
  const gated = p.locked && !open;

  return (
    <>
      <Rail />
      <article className="cbody">
        <header className="chead">
          <p className="eyebrow" data-r><span>{p.name}</span><span>{p.year}</span>{gated ? <span className="tag tag-lock">Locked</span> : null}</p>
          <h1 className="t-display" data-r>{p.headline}</h1>
        </header>
        {/* the details: inline under the title on smaller screens, a sticky column to the right on wide ones */}
        <aside className="meta-wrap" aria-label="Project details">
          <dl className="kv stack" data-r>
            {p.meta.map((m, k) => (
              <div key={k}>
                <dt className="t-label">{m.label}</dt>
                <dd>{m.label.toLowerCase() === 'status' ? <Status value={m.value} /> : m.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="prose" id="prose">
          <Prose content={pub} />
          {gated ? <Gate slug={slug} sections={sections} /> : <Prose content={priv} />}
        </div>
        <nav className="pn" aria-label="More projects" data-r>
          {prev ? (
            <a className="pv" href={`/work/${prev.slug}`}>
              <span className="t-label">Previous</span>
              <span className="pn-r"><Thumb kind={prev.thumb} src={prev.thumbnail} /><span className="nm">{prev.name}</span></span>
            </a>
          ) : <span />}
          {next ? (
            <a className="nx" href={`/work/${next.slug}`}>
              <span className="t-label">Next</span>
              <span className="pn-r"><span className="nm">{next.name}</span><Thumb kind={next.thumb} src={next.thumbnail} /></span>
            </a>
          ) : null}
        </nav>
      </article>
    </>
  );
}
