import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { reader } from './content';
import { COOKIE, token } from './nda';

/** The gallery's images, with NDA ones swapped for a tiny blurred preview unless the visitor has unlocked. */
export async function getGallery(opts: { previewsOnly?: boolean } = {}) {
  const g = await reader.singletons.gallery.read();
  const t = token();
  const unlocked = !opts.previewsOnly && !!t && (await cookies()).get(COOKIE)?.value === t;
  const items = (g?.items ?? []).filter((i) => i.image).map((i) => {
    const src = String(i.image);
    const m = src.match(/^\/media\/([^/]+)\/([^/]+)$/);
    const prev = m ? `/gallery/${m[1]}-${m[2]}` : null;
    const hasPrev = !!prev && existsSync(path.join(process.cwd(), 'public', prev));
    const hidden = !!i.locked && !unlocked;
    return { title: i.title, project: i.project, hidden, src: hidden ? null : src, preview: hasPrev ? prev : null };
  });
  return { intro: g?.intro ?? '', items, unlocked };
}
