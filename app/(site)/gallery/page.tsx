import type { Metadata } from 'next';
import { getGallery } from '@/lib/gallery';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Gallery: Oluwatimilehin Odunlami' };

// After Jesper Vos: one page of nothing but screens.
export default async function GalleryPage() {
  const { intro, items } = await getGallery();
  return (
    <main className="gal">
      <h1 data-r><span className="w5">Gallery</span> <span className="s3">{intro}</span></h1>
      <div className="gal-grid">
        {items.map((it, i) => it.hidden ? (
          <a key={i} className="gal-item locked" href={it.project ? `/work/${it.project}` : '#'} data-r>
            {it.preview ? <img src={it.preview} alt="" /> : <span className="gal-blank" />}
            <span className="gal-cap"><span className="tag">Locked</span>{it.project}</span>
          </a>
        ) : (
          <figure key={i} className="gal-item" data-r>
            <img className="zoom" src={it.src!} alt={it.title} loading="lazy" decoding="async" />
            <figcaption className="gal-cap"><span>{it.title}</span>{it.project ? <span className="s3">{it.project}</span> : null}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
