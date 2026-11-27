import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../globals.css';
import { getSite } from '@/lib/content';
import { spring } from '@/lib/spring';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Runtime } from '@/components/Runtime';
import { Sound } from '@/components/Sound';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const sp = spring();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{--spring:${sp.css};--spring-ms:${sp.ms}ms}` }} />
      <div className="loader" aria-hidden="true">
        <p className="ld-say">{site.say.split('-').map((x, i) => <span key={i} style={{ ['--i' as string]: i }}>{x}</span>)}</p>
        <p className="ld-name">{site.first}</p>
      </div>
      <div className="sheet">
        <div className="frame">
          <header className="top">
            <a className="brand" href="/">{site.name}</a>
            <Nav />
          </header>
          {children}
        </div>
      </div>
      <Footer />
      <div className="lb" id="lb" role="dialog" aria-modal="true" aria-label="Enlarged image"><img alt="" id="lb-img" /></div>
      <Runtime />
      <Sound />
    </>
  );
}
