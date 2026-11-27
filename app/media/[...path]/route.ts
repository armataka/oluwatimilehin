// Screens for the case studies live in /private, not /public, so a locked project's images
// are only sent to someone who has entered the password. Unlocked projects' images are open.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cookies } from 'next/headers';
import { getProjects } from '@/lib/content';
import { COOKIE, token } from '@/lib/nda';

const ROOT = path.join(process.cwd(), 'private', 'projects');
const TYPES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.join(ROOT, ...parts);
  if (!file.startsWith(ROOT + path.sep)) return new Response('Not found', { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });

  // open only if the first folder is a project that isn't locked; everything else needs the password
  const project = (await getProjects()).find((p) => p.slug === parts[0]);
  const open = project ? !project.locked : false;
  if (!open) {
    const t = token();
    if (!t || (await cookies()).get(COOKIE)?.value !== t) return new Response('Locked', { status: 401 });
  }
  try {
    const body = await readFile(file);
    return new Response(body, { headers: { 'content-type': type, 'cache-control': open ? 'public, max-age=31536000, immutable' : 'private, max-age=86400' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
