import { getSite, getProjects, reader } from '@/lib/content';
import { Pronounce } from '@/components/Pronounce';
import { Icon } from '@/components/Icon';
import { Thumb } from '@/components/Thumb';
import { Coin } from '@/components/Coin';

// Line breaks inside a paragraph hold on large screens and fall away on small ones.
const lines = (s: string) => s.split('\n').flatMap((l, i) => (i ? [' ', <br key={i} className="d" />, l] : [l]));

export default async function Home() {
  const [site, home, projects] = await Promise.all([getSite(), reader.singletons.home.readOrThrow(), getProjects()]);
  return (
    <main className="home">
      <section className="intro">
        <p data-r>Hi, my name is {site.first} <Pronounce say={site.say} meaning={site.meaning} audio={site.audio} />, <br className="d" />
          a product designer in Lagos, Nigeria.</p>
        {home.intro.map((p, i) => <p key={i} data-r className="s2">{lines(p)}</p>)}
        <p data-r className="s2">{home.openTo ? <>{home.openTo} <br className="d" /></> : null}
          <a className="ic" href="/me"><span className="u">More about me</span><Icon name="arrow-right" size={14} className="go" /></a></p>
        <Coin />
      </section>

      <section aria-labelledby="w">
        <h2 id="w" className="label s3" data-r>Projects</h2>
        <ul className="list">
          {projects.map((w) => (
            <li key={w.slug} data-r>
              <a className={`row pj-${w.thumb}`} href={`/work/${w.slug}`}>
                <Thumb kind={w.thumb} src={w.thumbnail} />
                <span className="txt">
                  <span className="nm"><span className="t">{w.name}</span>{w.locked ? <span className="tag">Locked</span> : null}</span>
                  <span className="ln s2">{w.line}</span>
                </span>
                <span className="yr s3 num">{w.year}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="e">
        <h2 id="e" className="label s3" data-r>Elsewhere</h2>
        <p className="links" data-r>
          <a className="u" href={`mailto:${site.email}`}>Email</a>
          <a className="u" href={site.linkedin}>LinkedIn</a>
          <a className="u" href={site.resume}>Résumé</a>
        </p>
      </section>
    </main>
  );
}
