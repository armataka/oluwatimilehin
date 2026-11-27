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
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];

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
          <h1 data-r><span className="w5">{p.name}</span> <span className="s3">{p.headline}</span></h1>
          <dl className="meta" data-r>
            {p.meta.map((m, k) => (<div key={k}><dt className="s3">{m.label}</dt><dd>{m.value}</dd></div>))}
          </dl>
        </header>
        <div className="prose" id="prose">
          <Prose content={pub} />
          {gated ? <Gate slug={slug} sections={sections} /> : <Prose content={priv} />}
        </div>
        <nav className="pn" aria-label="More projects" data-r>
          <a className="pv" href={`/work/${prev.slug}`}>
            <span className="s3">Previous</span>
            <span className="pn-r"><Thumb kind={prev.thumb} src={prev.thumbnail} /><span><span className="w5 nt">{prev.name}</span><br /><span className="s2">{prev.line}</span></span></span>
          </a>
          <a className="nx" href={`/work/${next.slug}`}>
            <span className="s3">Next</span>
            <span className="pn-r"><span><span className="w5 nt">{next.name}</span><br /><span className="s2">{next.line}</span></span><Thumb kind={next.thumb} src={next.thumbnail} /></span>
          </a>
        </nav>
      </article>
    </>
  );
}
