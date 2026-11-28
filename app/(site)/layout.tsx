import '@fontsource-variable/inter';
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
      {/* on arrival and on every reload (not between pages of the site): a white line is drawn round a dark disc, an ember at its head; when it closes the circle, the coin takes its place.
          The line and the ember share one SMIL timeline so the ember never runs ahead of the line. */}
      <div className="loader" aria-hidden="true">
        <div className="ld">
          <svg viewBox="-14 -14 128 128">
            <circle className="ld-disc" cx="50" cy="50" r="53" />
            <circle className="ld-line" cx="50" cy="50" r="48" pathLength="1" strokeDasharray="1 1" strokeDashoffset="1">
              <animate attributeName="stroke-dashoffset" from="1" to="0" begin="0.1s" dur="1.35s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".5 .1 .25 1" />
            </circle>
            <g className="ld-orbit">
              <circle className="ld-ember" cx="50" cy="2" r="2.6" />
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" begin="0.1s" dur="1.35s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".5 .1 .25 1" />
            </g>
            <circle className="ld-flash" cx="50" cy="50" r="48" />
          </svg>
          <div className="ld-coin"><CoinFace side="front" idp="ld" /></div>
        </div>
      </div>
      <div className="sheet">
        <div className="frame">
          <header className="top">
            <a className="brand" href="/" aria-label={`${site.name}, home`}>{site.brand || site.name}</a>
            <Nav />
          </header>
          {children}
        </div>
      </div>
      <Footer name={site.name} />
      <div className="lb" id="lb" role="dialog" aria-modal="true" aria-label="Enlarged image"><img alt="" id="lb-img" /></div>
      <Runtime />
      <Sound />
    </>
  );
}
