import { config, fields, collection, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

// Local editing in development. In production, edits are saved to GitHub
// (set KEYSTATIC_STORAGE=github and the Keystatic GitHub app variables, see README).
const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === 'github'
    ? ({ kind: 'github', repo: 'armataka/oluwatimilehin' } as const)
    : ({ kind: 'local' } as const);

const line = (label: string, description?: string) => fields.text({ label, description });
const para = (label: string, description?: string) => fields.text({ label, description, multiline: true });

export default config({
  storage,
  ui: { brand: { name: 'Oluwatimilehin' } },
  singletons: {
    site: singleton({
      label: 'Site details',
      path: 'content/site',
      schema: {
        name: line('Full name'),
        first: line('First name'),
        say: line('How to say it', 'Syllables joined with hyphens, e.g. oh-loo-wah'),
        meaning: line('What the name means'),
        email: line('Email'),
        linkedin: line('LinkedIn URL'),
        resume: line('Résumé URL', 'A link, or /resume.pdf once the file is in /public'),
        updated: line('Last updated', 'Shown in Kit'),
      },
    }),
    home: singleton({
      label: 'Highlights (home)',
      path: 'content/home',
      schema: {
        intro: fields.array(para('Paragraph', 'A new line inside a paragraph becomes a line break on large screens'), {
          label: 'Introduction',
          itemLabel: (p) => p.value.slice(0, 48) || 'Paragraph',
        }),
        openTo: line('Open to', 'The last line of the introduction'),
      },
    }),
    me: singleton({
      label: 'Me',
      path: 'content/me',
      schema: {
        bio: fields.array(para('Paragraph'), { label: 'Bio', itemLabel: (p) => p.value.slice(0, 48) || 'Paragraph' }),
        playbook: fields.array(fields.object({ title: line('Title'), text: para('Text') }), { label: 'My playbook', itemLabel: (p) => p.fields.title.value || 'Play' }),
        offTheClock: para('Off the clock'),
        rightNow: fields.array(fields.object({ label: line('Label'), value: line('Value') }), { label: 'Right now', itemLabel: (p) => p.fields.label.value || 'Row' }),
      },
    }),
    kit: singleton({
      label: 'Kit',
      path: 'content/kit',
      schema: {
        rows: fields.array(fields.object({ label: line('Label'), value: line('Value') }), { label: 'What the site is made of', itemLabel: (p) => p.fields.label.value || 'Row' }),
        credits: fields.array(fields.object({ label: line('What'), name: line('Who'), url: fields.url({ label: 'Link' }) }), { label: 'After', itemLabel: (p) => p.fields.label.value || 'Credit' }),
        thanks: fields.array(fields.object({ name: line('Name'), url: fields.url({ label: 'Link' }) }), { label: 'With thanks', itemLabel: (p) => p.fields.name.value || 'Name' }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'name',
      path: 'content/projects/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['name', 'year'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        order: fields.integer({ label: 'Order on the list', defaultValue: 1 }),
        line: line('One-line description'),
        year: line('Year', 'e.g. 2025–26'),
        locked: fields.checkbox({ label: 'Locked (NDA)', description: 'Only the summary is public; the rest needs the password', defaultValue: false }),
        thumb: fields.select({
          label: 'Thumbnail style',
          options: [
            { label: 'Green sidebar (TAMA)', value: 'tama' },
            { label: 'Navy sidebar (Kita)', value: 'kita' },
            { label: 'Light with green bar (Brydge)', value: 'brydge' },
          ],
          defaultValue: 'tama',
        }),
        thumbnail: fields.image({ label: 'Thumbnail image (optional)', description: 'Replaces the drawn thumbnail', directory: 'public/images/thumbs', publicPath: '/images/thumbs/' }),
        headline: line('Headline'),
        meta: fields.array(fields.object({ label: line('Label'), value: line('Value') }), { label: 'Details', itemLabel: (p) => p.fields.label.value || 'Detail' }),
        lede: para('Opening paragraph'),
        summary: fields.array(para('Paragraph'), { label: 'Summary (always public)', itemLabel: (p) => p.value.slice(0, 48) || 'Paragraph' }),
        body: fields.markdoc({
          label: 'Case study',
          options: { image: { directory: 'public/images/projects', publicPath: '/images/projects/' } },
          components: {
            Figure: block({
              label: 'Screen',
              schema: {
                src: fields.image({ label: 'Image', directory: 'public/images/projects', publicPath: '/images/projects/' }),
                label: line('Placeholder label', 'Shown until an image is added'),
                caption: line('Caption'),
                ratio: fields.select({ label: 'Shape', options: [{ label: '16:10', value: '16 / 10' }, { label: '21:9', value: '21 / 9' }, { label: '4:3', value: '4 / 3' }], defaultValue: '16 / 10' }),
              },
            }),
            Steps: block({
              label: 'Steps',
              schema: {
                items: fields.array(
                  fields.object({ phase: line('Phase heading', 'Leave empty to stay in the previous phase'), stage: line('Stage'), who: line('Who'), what: para('What happens'), sendsBack: fields.checkbox({ label: 'Can send it back' }) }),
                  { label: 'Steps', itemLabel: (p) => p.fields.stage.value || 'Step' },
                ),
              },
            }),
            Stats: block({
              label: 'Figures',
              schema: { items: fields.array(fields.object({ value: line('Figure'), label: line('Label') }), { label: 'Figures', itemLabel: (p) => p.fields.value.value || 'Figure' }) },
            }),
            Modules: block({
              label: 'Modules',
              schema: { items: fields.array(fields.object({ name: line('Name'), description: line('Description') }), { label: 'Modules', itemLabel: (p) => p.fields.name.value || 'Module' }) },
            }),
          },
        }),
      },
    }),
  },
});
