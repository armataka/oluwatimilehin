// Loader candidates, side by side in both themes. Not linked or indexed; for choosing one.
import type { Metadata } from 'next';
import { LoaderGallery } from '@/components/PixelLoaders';

export const metadata: Metadata = { title: 'Loaders', robots: { index: false, follow: false } };

export default function Loaders() {
  return (
    <main className="sys">
      <div className="eyebrow t-label"><span>System</span><span>Loaders</span></div>
      <h1 className="t-display">Pixel loaders</h1>
      <p className="lede">Five candidates, drawn on the same square-pixel grid as the site&rsquo;s icons. Each is black on the light theme and white on the dark one. Shown at real size.</p>
      <LoaderGallery />
    </main>
  );
}
