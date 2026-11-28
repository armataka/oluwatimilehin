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
        {home.intro.map((p, i) => <p key={i} data-r>{lines(p)}</p>)}
        <p data-r className="go"><a className="link-go" href="/me">{home.more || 'More about me here'}<Icon name="arrow-right" size={14} /></a></p>
        <p className="links" data-r>
          {/* the address appears above in a small box when you point at it */}
          <a className="link tipw" href={`mailto:${site.email}`}>Email<span className="tip mono" aria-hidden="true">{site.email}</span></a>
          <a className="link" href={site.linkedin}>LinkedIn</a>
        </p>
        <Coin />
      </section>

      <section aria-labelledby="w">
        <h2 id="w" className="t-heading" data-r>Projects</h2>
        <ul className="rows">
          {projects.map((w) => (
            <li key={w.slug} data-r>
              <a className="row" href={`/work/${w.slug}`}>
                <Thumb kind={w.thumb} src={w.thumbnail} />
                <span>
                  <span className="row-name"><span className="nm">{w.name}</span></span>
                  <span className="row-line">{w.line}</span>
                </span>
                <span className="row-year num">{w.year}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
