import { getSite, getProjects, reader } from '@/lib/content';
import { Say } from '@/components/Say';
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
        <p data-r>Hi, my name is <Say name={site.first} say={site.say} meaning={site.meaning} />.</p>
        {home.intro.map((p, i) => <p key={i} data-r className="s2">{lines(p)}</p>)}
        <p data-r><a className="ic" href="/me"><span className="u">{home.more || 'More about me here'}</span><Icon name="arrow-right" size={14} className="go" /></a></p>
        <p className="links" data-r>
          {/* the address appears above in a small box when you point at it */}
          <a className="u tipw" href={`mailto:${site.email}`}>Email<span className="tip mono" aria-hidden="true">{site.email}</span></a>
          <a className="u" href={site.linkedin}>LinkedIn</a>
        </p>
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
                  <span className="nm"><span className="t">{w.name}</span></span>
                  <span className="ln s2">{w.line}</span>
                </span>
                <span className="yr s3 num">{w.year}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
