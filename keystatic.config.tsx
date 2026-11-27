import { config, fields, collection, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

// Local editing in development; on the live site, Keystatic Cloud signs you in with GitHub and commits your edits.
const storage = process.env.NODE_ENV === 'production' ? ({ kind: 'cloud' } as const) : ({ kind: 'local' } as const);

const line = (label: string, description?: string) => fields.text({ label, description });
const para = (label: string, description?: string) => fields.text({ label, description, multiline: true });

export default config({
  storage,
  cloud: { project: 'oluwatimilehin/oluwatimilehin-site' },
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
        audio: fields.file({ label: 'Name recording', description: 'You saying your name (mp3 or m4a). Plays from the pronunciation.', directory: 'public/audio', publicPath: '/audio/' }),
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
      },
    }),
    gallery: singleton({
      label: 'Gallery',
      path: 'content/gallery',
      schema: {
        intro: line('Introduction'),
        items: fields.array(
          fields.object({
            image: fields.image({ label: 'Image', directory: 'private/projects/gallery', publicPath: '/media/gallery/' }),
            title: line('Title'),
            project: line('Project', 'e.g. tama, kita, or leave empty'),
            locked: fields.checkbox({ label: 'Under NDA', description: 'Shown blurred until the password is entered', defaultValue: false }),
          }),
          { label: 'Images', itemLabel: (p) => p.fields.title.value || 'Image' },
        ),
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
        locked: fields.checkbox({ label: 'Locked (NDA)', description: 'Everything below the password line in the case study needs the password', defaultValue: false }),
        thumb: fields.select({
          label: 'Thumbnail colours and mark',
          options: [
            { label: 'TAMA (green)', value: 'tama' },
            { label: 'Kita (indigo)', value: 'kita' },
            { label: 'Brydge (teal)', value: 'brydge' },
          ],
          defaultValue: 'tama',
        }),
        thumbnail: fields.image({ label: 'Thumbnail image (optional)', description: 'Replaces the drawn thumbnail', directory: 'public/images/thumbs', publicPath: '/images/thumbs/' }),
        headline: line('Headline'),
        meta: fields.array(fields.object({ label: line('Label'), value: line('Value') }), { label: 'Details', itemLabel: (p) => p.fields.label.value || 'Detail' }),
        body: fields.markdoc({
          label: 'Case study',
          // case-study images go to /private and are served through /media, so locked ones stay behind the password
          options: { image: { directory: 'private/projects', publicPath: '/media/' } },
          components: {
            Figure: block({
              label: 'Screen',
              schema: {
                src: fields.image({ label: 'Image', directory: 'private/projects', publicPath: '/media/' }),
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
            Loop: block({
              label: 'Loop of screens',
              description: 'One frame that cycles through screens; hover holds, click enlarges',
              schema: { items: fields.array(
                  fields.object({ src: fields.image({ label: 'Screen', directory: 'private/projects', publicPath: '/media/' }), label: line('Caption') }),
                  { label: 'Screens', itemLabel: (p) => p.fields.label.value || 'Screen' },
                ) },
            }),
            Gallery: block({
              label: 'Drifting strip',
              description: 'A strip of screens that drifts on a loop; click one to enlarge it',
              schema: {
                items: fields.array(
                  fields.object({ src: fields.image({ label: 'Screen', directory: 'private/projects', publicPath: '/media/' }), label: line('Caption') }),
                  { label: 'Screens', itemLabel: (p) => p.fields.label.value || 'Screen' },
                ),
              },
            }),
            Locked: block({
              label: 'Password line',
              description: 'Everything above this is public; everything below it is only shown after the password (when Locked is ticked)',
              schema: {},
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
