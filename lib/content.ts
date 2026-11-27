import 'server-only';
import { createReader } from '@keystatic/core/reader';
import Markdoc from '@markdoc/markdoc';
import config from '../keystatic.config';

export const reader = createReader(process.cwd(), config);

export async function getSite() {
  const s = await reader.singletons.site.readOrThrow();
  return s;
}

export async function getProjects() {
  const all = await reader.collections.projects.all();
  return all
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Turn a project's Markdoc body into a renderable tree. */
export async function getBody(slug: string) {
  const p = await reader.collections.projects.read(slug, { resolveLinkedFiles: true });
  if (!p) return null;
  const { node } = p.body;
  // the node comes from Keystatic's own copy of Markdoc
  const n = node as unknown as Parameters<typeof Markdoc.transform>[0] & import('@markdoc/markdoc').Node;
  const errors = Markdoc.validate(n, markdocConfig);
  if (errors.length) console.error(errors);
  return Markdoc.transform(n, markdocConfig);
}

export const markdocConfig = {
  tags: {
    Figure: { render: 'Figure', selfClosing: true, attributes: { src: { type: String }, label: { type: String }, caption: { type: String }, ratio: { type: String } } },
    Steps: { render: 'Steps', selfClosing: true, attributes: { items: { type: Array } } },
    Stats: { render: 'Stats', selfClosing: true, attributes: { items: { type: Array } } },
    Modules: { render: 'Modules', selfClosing: true, attributes: { items: { type: Array } } },
  },
};
