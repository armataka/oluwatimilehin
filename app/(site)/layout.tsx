import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../globals.css';
import { getSite } from '@/lib/content';
import { spring } from '@/lib/spring';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Runtime } from '@/components/Runtime';
import { Sound } from '@/components/Sound';
import { CoinFace } from '@/components/CoinFace';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const sp = spring();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{--spring:${sp.css};--spring-ms:${sp.ms}ms}` }} />
      {/* first visit: a line is drawn round a dark disc, an ember at its head; when it closes the circle, the coin takes its place */}
      <div className="loader" aria-hidden="true">
        <div className="ld">
          <svg viewBox="-14 -14 128 128">
            <circle className="ld-disc" cx="50" cy="50" r="46" />
            <circle className="ld-line" cx="50" cy="50" r="50" pathLength="1" />
            <g className="ld-orbit"><circle className="ld-ember" cx="50" cy="0" r="2.6" /></g>
            <circle className="ld-flash" cx="50" cy="50" r="50" />
          </svg>
          <div className="ld-coin"><CoinFace side="front" idp="ld" /></div>
        </div>
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
