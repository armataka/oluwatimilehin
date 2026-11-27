// The UI system, on one page: every token and component the site is built from.
// Not linked from anywhere and not indexed; it's for reviewing the system before it replaces the old styles.
import type { Metadata } from 'next';
import '../../ds.css';
import { Icon } from '@/components/Icon';
import { Thumb } from '@/components/Thumb';

export const metadata: Metadata = { title: 'UI system', robots: { index: false, follow: false } };

const COLOURS: [string, string, string][] = [
  ['--bg', 'Page', '#FFFFFF / #111110'],
  ['--wash', 'Wash: fields, placeholders', '#F5F5F4 / #1A1A19'],
  ['--line', 'Lines and borders', '#E7E7E3 / #2A2A28'],
  ['--ink', 'Ink: headings, names, values', '#121211 / #EFEEE9'],
  ['--ink-2', 'Ink 2: body copy', '#55554F / #A9A8A2'],
  ['--ink-3', 'Ink 3: labels, captions, meta', '#85857F / #77766F'],
  ['--accent', 'Accent: every hover, focus, current', '#2142C5 / #93B0FF'],
  ['--good', 'Status: live, built', '#0B7A46 / #4FD18B'],
  ['--warn', 'Status: in progress', '#B25E09 / #F5B14A'],
];

const TYPE: [string, string, string][] = [
  ['t-display', 'Making every tax audit visible', 'Display · 600 · 28/1.2 · page titles, stat figures'],
  ['t-heading', 'Creating and approving audit cases', 'Heading · 600 · 16/1.4 · sections, modules'],
  ['t-lede', 'A state tax authority ran audits on paper, spreadsheets and email.', 'Lede · 450 · 16/1.55 · first paragraph'],
  ['t-body', 'Audit managers create cases and assign each one a team.', 'Body · 450 · 14/1.6 · everything you read'],
  ['t-small', 'Admins decide which documents every audit must collect.', 'Small · 450 · 13/1.5 · captions, meta, footer'],
  ['t-label', 'Allocation · Locked · Client', 'Label · Plex Mono 500 · 11 · caps · nav, eyebrows, tags, labels'],
];

const SPACE = [[1, 4], [2, 8], [3, 12], [4, 16], [5, 24], [6, 32], [7, 48], [8, 64], [9, 96]];

function Block({ n, name, use, children }: { n: string; name: string; use: string; children: React.ReactNode }) {
  return (
    <section className="sys-blk">
      <span className="t-label">{n}</span>
      <h2 className="t-heading">{name}</h2>
      <p className="use t-small">{use}</p>
      {children}
    </section>
  );
}

export default function System() {
  return (
    <main className="ds">
      <div className="eyebrow t-label"><span>System</span><span>v1 · for review</span></div>
      <h1 className="t-display">The UI system</h1>
      <p className="t-lede ink-2" style={{ marginTop: 'var(--sp-3)' }}>Six text styles, one spacing scale, one accent, one corner radius for everything small. Every page is built from what&rsquo;s on this page, and nothing else.</p>

      <section className="sec">
        <span className="t-label">Rules</span>
        <ol className="ol">
          <li><span className="t-label">01</span><span>Every hover, focus and &ldquo;you are here&rdquo; is the blue accent. No other colour reacts.</span></li>
          <li><span className="t-label">02</span><span>Colour means status (green, amber) or a project (only inside its thumbnail). Never decoration.</span></li>
          <li><span className="t-label">03</span><span>Six text styles. Anything small and structural is a mono label; everything you read is sans.</span></li>
          <li><span className="t-label">04</span><span>Space comes from the 4px scale. Screens, thumbnails, tags, chips, buttons and fields have 4px corners.</span></li>
          <li><span className="t-label">05</span><span>One line weight (1px), one shadow, and only screens get the shadow.</span></li>
          <li><span className="t-label">06</span><span>Three speeds: fast for colour, normal for state, slow for things arriving.</span></li>
        </ol>
      </section>

      {/* ============================== foundations ============================== */}
      <Block n="01 · Colour" name="Colour" use="Shown in both themes. Light-mode and dark-mode values side by side.">
        <div className="sys-pair">
          {(['light', 'dark'] as const).map((m) => (
            <div key={m} className={`sys-mode ${m}`}>
              <div className="t-label ink-3" style={{ marginBottom: 'var(--sp-3)' }}>{m}</div>
              {COLOURS.map(([v, label]) => (
                <div key={v} className="sw t-small"><i style={{ '--c': `var(${v})` } as React.CSSProperties} /><span>{label}</span><span className="t-label">{v.slice(2)}</span></div>
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block n="02 · Type" name="Type" use="System sans for reading, IBM Plex Mono for labels. Six styles in total.">
        <div className="sys-demo">
          {TYPE.map(([c, sample, spec]) => (
            <div key={c} className="spec"><span className={c}>{sample}</span><span className="t-small">{spec}</span></div>
          ))}
        </div>
      </Block>

      <Block n="03 · Space" name="Space" use="Every gap, margin and padding is one of these.">
        <div className="sys-demo bars t-small">
          {SPACE.map(([n, px]) => (
            <div key={n}><span className="t-label">sp-{n}</span><span className="num">{px}px</span><b style={{ '--w': `${px * 2}px` } as React.CSSProperties} /></div>
          ))}
        </div>
      </Block>

      <Block n="04 · Shape and depth" name="Shape and depth" use="4px for anything small, 12px for the page sheet, round for dots. One line weight, one shadow, for screens only.">
        <div className="sys-demo shapes t-small">
          <div><i style={{ borderRadius: 'var(--r-1)' }} /><span>r-1 · 4px</span></div>
          <div><i style={{ borderRadius: 'var(--r-2)' }} /><span>r-2 · 12px · sheet</span></div>
          <div><i style={{ background: 'none', border: 'var(--hair)', borderRadius: 'var(--r-1)' }} /><span>Line · 1px</span></div>
          <div><i style={{ background: 'var(--bg)', borderRadius: 'var(--r-1)', boxShadow: 'var(--shadow-screen)' }} /><span>Screen shadow</span></div>
        </div>
      </Block>

      <Block n="05 · Motion" name="Motion" use="Point at the box. Fast is colour, normal is state, slow is things arriving.">
        <div className="sys-demo mo t-small">
          <div className="f"><span>Fast · 150ms</span><b /></div>
          <div className="b"><span>Normal · 300ms</span><b /></div>
          <div className="s"><span>Slow · 600ms</span><b /></div>
        </div>
      </Block>

      {/* ============================== components ============================== */}
      <Block n="06 · Links" name="Links" use="Text links, links that go somewhere, and the nav.">
        <div className="sys-demo sys-row">
          <a className="link" href="#">Email</a>
          <a className="link" href="#">LinkedIn</a>
          <a className="link-go" href="#">More about me<Icon name="arrow-right" size={14} /></a>
          <nav className="nav t-label" aria-label="Example">
            <a className="nav-link" href="#" aria-current="page">Highlights</a><a className="nav-link" href="#">Me</a><a className="nav-link" href="#">Kit</a>
          </nav>
        </div>
      </Block>

      <Block n="07 · Tags and status" name="Tags and status" use="A tag marks a property (Locked). A status chip says where a project stands, in green or amber.">
        <div className="sys-demo sys-row">
          <span className="tag t-label">Locked</span>
          <span className="chip live t-label"><i />Live</span>
          <span className="chip built t-label"><i />Built</span>
          <span className="chip wip t-label"><i />In progress</span>
          <span className="chip t-label"><i />Past</span>
        </div>
      </Block>

      <Block n="08 · Buttons" name="Buttons" use="Few on this site: the unlock button, the coin, the theme switch.">
        <div className="sys-demo sys-row">
          <button className="btn" type="button">Unlock</button>
          <button className="btn ghost" type="button">Open screen</button>
          <button className="btn icon" type="button" aria-label="Go"><Icon name="arrow-right" size={16} /></button>
          <div className="seg" role="radiogroup" aria-label="Theme">
            <button type="button" role="radio" aria-checked="true" aria-label="System"><Icon name="monitor" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Light"><Icon name="sun" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Dark"><Icon name="moon" size={16} /></button>
          </div>
        </div>
      </Block>

      <Block n="09 · Project rows" name="Project rows" use="The home page list. Point at a row: the name turns blue and underlines, the thumbnail takes its colour.">
        <div className="sys-demo">
          <ul className="rows">
            <li><a className="row" href="#"><Thumb kind="tama" /><span><span className="row-name"><span className="nm">TAMA</span><span className="tag t-label">Locked</span></span><span className="row-line t-small" style={{ display: 'block' }}>Tax audit management for a state revenue authority</span></span><span className="row-year t-small num">2025–26</span></a></li>
            <li><a className="row" href="#"><Thumb kind="kita" /><span><span className="row-name"><span className="nm">Kita</span><span className="tag t-label">Locked</span></span><span className="row-line t-small" style={{ display: 'block' }}>The platform an energy company runs its operations on</span></span><span className="row-year t-small num">2024–26</span></a></li>
            <li><a className="row" href="#"><Thumb kind="brydge" /><span><span className="row-name"><span className="nm">Brydge</span></span><span className="row-line t-small" style={{ display: 'block' }}>Payments for a cross-border trade platform</span></span><span className="row-year t-small num">2024</span></a></li>
          </ul>
        </div>
      </Block>

      <Block n="10 · Key and value" name="Key and value" use="Me, Kit and the case-study details. Side by side in the page; stacked in the details column and on phones.">
        <div className="sys-pair">
          <div className="sys-demo">
            <dl className="kv">
              <div><dt className="t-label">Reading</dt><dd>Thinking in Systems, Donella Meadows</dd></div>
              <div><dt className="t-label">Listening</dt><dd>Whatever&rsquo;s on in the footer</dd></div>
              <div><dt className="t-label">Learning</dt><dd>Writing case studies people finish</dd></div>
            </dl>
          </div>
          <div className="sys-demo">
            <dl className="kv stack">
              <div><dt className="t-label">Role</dt><dd className="t-small">Product Designer (Lead)</dd></div>
              <div><dt className="t-label">Timeline</dt><dd className="t-small">Nov 25 – Apr 26</dd></div>
              <div><dt className="t-label">Status</dt><dd className="t-small"><span className="chip built t-label"><i />Built</span><span className="ink-2" style={{ display: 'block', marginTop: 'var(--sp-2)' }}>Rolls out next audit cycle</span></dd></div>
            </dl>
          </div>
        </div>
      </Block>

      <Block n="11 · Reading" name="Case-study head, sections and copy" use="The eyebrow and title open a case study; every section is a heading and copy, with an optional label above.">
        <div className="sys-demo">
          <div className="eyebrow t-label"><span>TAMA</span><span>2025–26</span><span className="tag">Locked</span></div>
          <h3 className="t-display">Making every tax audit visible, from planning to assessment</h3>
          <section className="sec" style={{ marginTop: 'var(--sp-7)' }}>
            <span className="t-label">The problem</span>
            <h2 className="t-heading">Nobody could see where an audit stood</h2>
            <div className="copy">
              <p>Progress lived in spreadsheets updated by hand every week or two, so the people accountable for audits couldn&rsquo;t tell which cases were moving and which were stuck.</p>
              <p>In TAMA, <strong>every case carries its stage</strong>, and every role sees the cases in its hands.</p>
            </div>
          </section>
        </div>
      </Block>

      <Block n="12 · Screens" name="Screens" use="A single screen with a caption, or a loop of screens with ticks and the current screen's name.">
        <div className="sys-pair">
          <figure className="fig" style={{ margin: 0 }}><div className="ph t-label">Screen</div><figcaption className="t-small">An audit manager creates the case and assigns the team in one step.</figcaption></figure>
          <figure style={{ margin: 0 }}>
            <div className="loop-stage" />
            <figcaption className="loop-cap"><span className="ticks"><i className="done" /><i className="on" /><i /><i /></span><span className="t-label ink-3">02 · The approval pipeline</span></figcaption>
          </figure>
        </div>
      </Block>

      <Block n="13 · Steps" name="Steps" use="A sequence people move through. The line and dots fill as you read down.">
        <div className="sys-demo">
          <ol className="steps">
            <li className="phase t-label">Allocation</li>
            <li className="step on"><span className="dot t-label">01</span><span><span className="t-strong">Create</span><span className="who t-small">Audit manager</span><span className="what">Creates the case and assigns one external and one internal auditor.</span></span></li>
            <li className="step on"><span className="dot t-label">02</span><span><span className="t-strong">Approve</span><span className="who t-small">Audit executive</span><span className="what">Approves the allocation. Both auditors are notified.</span></span></li>
            <li className="phase t-label">Review</li>
            <li className="step"><span className="dot t-label">03</span><span><span className="t-strong">Vetting</span><span className="who t-small">Review officers</span><span className="what">Each officer re-computes the figures in turn.</span><span className="tag t-label">Can send back</span></span></li>
          </ol>
        </div>
      </Block>

      <Block n="14 · Impact" name="Impact" use="What changed for the people using it: the figure now, what it was before, and what it measures. Placeholder figures.">
        <div className="sys-demo">
          <div className="stats" style={{ margin: 0 }}>
            <div className="stat"><b>Live</b><span className="was t-small">Every 1–2 weeks</span><span className="what t-small">How current an audit&rsquo;s status is</span></div>
            <div className="stat"><b className="num">1</b><span className="was t-small">4 tools</span><span className="what t-small">Places an audit lives</span></div>
            <div className="stat"><b className="num">0</b><span className="was t-small">Email threads</span><span className="what t-small">Approvals outside the system</span></div>
          </div>
        </div>
      </Block>

      <Block n="15 · Module" name="Module" use="One part of a product, the same shape every time: where it sits, who uses it, the one decision that mattered, its screens.">
        <div className="sys-demo">
          <section className="mod" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
            <header className="mod-h"><span className="t-label">02</span><span className="t-label">Allocation</span><h3 className="t-heading">Creating and approving audit cases</h3></header>
            <dl className="mod-meta t-small">
              <div><dt>Who</dt><dd>Audit managers, the audit executive</dd></div>
              <div><dt>Before</dt><dd>Allocation memos passed by hand and email</dd></div>
            </dl>
            <div className="copy"><p>Two roles with a clean split: managers create cases and assign a team, the executive approves. Everything after hangs off that handshake.</p></div>
            <figure className="fig" style={{ marginBottom: 0 }}><div className="ph t-label">Screen</div><figcaption className="t-small">Creating a case and assigning its team.</figcaption></figure>
          </section>
          <section className="mod">
            <header className="mod-h"><span className="t-label">01</span><span className="t-label">Legal</span><h3 className="t-heading">Contracts, licences and permits</h3></header>
            <dl className="mod-meta t-small">
              <div><dt>Owns</dt><dd>Contracts, Licences, Permits</dd></div>
              <div><dt>Also</dt><dd>Select people outside Legal can read and edit</dd></div>
            </dl>
            <div className="copy"><p>One line on the decision that mattered here.</p></div>
          </section>
        </div>
      </Block>

      <Block n="16 · Previous and next" name="Previous and next" use="The end of a case study. The first project has no previous; the last has no next.">
        <div className="sys-demo">
          <nav className="pn" aria-label="Example" style={{ marginTop: 0 }}>
            <a className="pv" href="#"><span className="t-label">Previous</span><span className="pn-r"><Thumb kind="tama" /><span><span className="nm">TAMA</span><br /><span className="t-small ink-2">Tax audit management for a state revenue authority</span></span></span></a>
            <a className="nx" href="#"><span className="t-label">Next</span><span className="pn-r"><span><span className="nm">Brydge</span><br /><span className="t-small ink-2">Payments for a cross-border trade platform</span></span><Thumb kind="brydge" /></span></a>
          </nav>
        </div>
      </Block>

      <Block n="17 · Field" name="Field" use="The password for locked case studies.">
        <div className="sys-demo" style={{ maxWidth: 420 }}>
          <div className="field"><Icon name="key" size={16} /><input type="password" placeholder="Password" aria-label="Password" /><button className="btn icon" type="button" aria-label="Unlock"><Icon name="arrow-right" size={16} /></button></div>
          <p className="t-small ink-3" style={{ margin: 'var(--sp-2) 0 0' }}>Ask me for the password.</p>
        </div>
      </Block>

      <Block n="18 · Footer bar" name="Footer bar" use="Always dark. Small type, the same switch, the same icons.">
        <div className="bar t-small">
          <span className="fi"><Icon name="music" size={14} />Nothing playing</span>
          <div className="seg" role="radiogroup" aria-label="Theme">
            <button type="button" role="radio" aria-checked="true" aria-label="System"><Icon name="monitor" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Light"><Icon name="sun" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Dark"><Icon name="moon" size={16} /></button>
          </div>
          <span className="fi end"><Icon name="clock" size={14} />Lagos 20:57</span>
        </div>
      </Block>
    </main>
  );
}
