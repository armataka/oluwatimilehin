// The UI system, on one page: every token and component the site is built from.
// Not linked from anywhere and not indexed; it's for reviewing the system before it replaces the old styles.
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { Thumb } from '@/components/Thumb';

export const metadata: Metadata = { title: 'UI system', robots: { index: false, follow: false } };

const COLOURS: [string, string][] = [
  ['--bg', 'Page'],
  ['--wash', 'Wash: fields, placeholders'],
  ['--line', 'Lines and borders'],
  ['--ink', 'Ink: everything you read'],
  ['--ink-2', 'Ink 2: second lines, captions'],
  ['--ink-3', 'Ink 3: labels, meta'],
  ['--accent', 'Gold, from the coin: hover, focus, current'],
  ['--live-dot', 'Status: live'],
  ['--built-dot', 'Status: built'],
  ['--wip-dot', 'Status: in progress'],
];

const TYPE: [string, string, string][] = [
  ['t-display', 'Making every tax audit visible', 'Display  600  22 on 28'],
  ['t-heading', 'Creating and approving audit cases', 'Heading  600  14 on 21'],
  ['t-body', 'Audit managers create cases and assign each one a team.', 'Body  400  14 on 21'],
  ['t-small', 'Admins decide which documents every audit must collect.', 'Small  400  12.5 on 18'],
  ['t-label', 'Allocation  Locked  Client', 'Label  Plex Mono 500  11  caps'],
];

const SPACE = [[1, 7], [2, 14], [3, 21], [4, 28], [5, 42], [6, 56], [7, 84], [8, 112]];

function Block({ name, use, children }: { name: string; use: string; children: React.ReactNode }) {
  return (
    <section className="sys-blk">
      <h2 className="t-heading">{name}</h2>
      <p className="use">{use}</p>
      {children}
    </section>
  );
}

export default function System() {
  return (
    <main className="sys">
      <div className="eyebrow t-label"><span>System</span><span>Version 2</span></div>
      <h1 className="t-display">The UI system</h1>
      <p className="lede">Type and spacing learned from Sesan: Inter at 14 on a 21px line, hierarchy by weight rather than size, a 7px rhythm, one 680px column. Every page is built from what&rsquo;s here and nothing else.</p>

      <section className="sec">
        <h2 className="t-heading">Rules</h2>
        <ol className="ol">
          <li><span className="t-label">01</span><span>Everything you read is 14px. Headings stand out by weight, not size. Only page titles and figures are bigger.</span></li>
          <li><span className="t-label">02</span><span>Space is a multiple of 7: 14 between paragraphs, 84 between sections.</span></li>
          <li><span className="t-label">03</span><span>Gold, from the coin, is the only colour that reacts: hover, focus, where you are.</span></li>
          <li><span className="t-label">04</span><span>Other colour means status, or a project inside its own thumbnail. Never decoration.</span></li>
          <li><span className="t-label">05</span><span>4px corners on screens and small parts, 2px on thumbnails and the email box; round for dots and chips; 24.5px on the page as it lifts off the footer. One line weight, one shadow, screens only.</span></li>
          <li><span className="t-label">06</span><span>Mono capitals for small structural labels: nav, tags, chips, buttons, details. No dot separators.</span></li>
        </ol>
      </section>

      {/* ============================== foundations ============================== */}
      <Block name="Colour" use="Light and dark, side by side.">
        <div className="sys-pair">
          {(['light', 'dark'] as const).map((m) => (
            <div key={m} className={`sys-mode ${m}`}>
              <div className="t-label ink-3" style={{ marginBottom: 'var(--sp-1)' }}>{m}</div>
              {COLOURS.map(([v, label]) => (
                <div key={v} className="sw t-small"><i style={{ '--c': `var(${v})` } as React.CSSProperties} /><span>{label}</span><span className="t-label">{v.slice(2).replace('-dot', '')}</span></div>
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block name="Type" use="Inter for reading, IBM Plex Mono for labels. Five styles.">
        <div className="sys-demo">
          {TYPE.map(([c, sample, spec]) => (
            <div key={c} className="spec"><span className={c}>{sample}</span><span className="t-small" style={{ whiteSpace: 'pre' }}>{spec}</span></div>
          ))}
        </div>
      </Block>

      <Block name="Space" use="Every gap, margin and padding between things is one of these.">
        <div className="sys-demo bars t-small">
          {SPACE.map(([n, px]) => (
            <div key={n}><span className="t-label">sp {n}</span><span className="num">{px}px</span><b style={{ '--w': `${px * 2}px` } as React.CSSProperties} /></div>
          ))}
        </div>
      </Block>

      <Block name="Shape and depth" use="4px corners, one 1px line, one shadow for screens. The page itself rounds to 24.5px when the footer opens.">
        <div className="sys-demo shapes t-small">
          <div><i style={{ borderRadius: 'var(--r)' }} /><span>4px corners</span></div>
          <div><i style={{ background: 'none', border: 'var(--hair)', borderRadius: 'var(--r)' }} /><span>1px line</span></div>
          <div><i style={{ background: 'var(--bg)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow-screen)' }} /><span>Screen shadow</span></div>
        </div>
      </Block>

      <Block name="Motion" use="Point at the boxes. Fast for colour, normal for state, slow for things arriving.">
        <div className="sys-demo mo t-small">
          <div className="f"><span>Fast  150ms</span><b /></div>
          <div className="b"><span>Normal  300ms</span><b /></div>
          <div className="s"><span>Slow  600ms</span><b /></div>
        </div>
      </Block>

      {/* ============================== components ============================== */}
      <Block name="Links" use="Text links, links that go somewhere, the nav and breadcrumbs.">
        <div className="sys-demo sys-row">
          <a className="link" href="#">Email</a>
          <a className="link" href="#">LinkedIn</a>
          <a className="link-go" href="#">More about me<Icon name="arrow-right" size={14} /></a>
          <nav className="nav t-label" aria-label="Example">
            <a className="nav-link" href="#" aria-current="page">Highlights</a><a className="nav-link" href="#">Me</a><a className="nav-link" href="#">Kit</a>
          </nav>
        </div>
        <div className="sys-demo">
          <nav className="crumbs t-small" aria-label="Breadcrumb" style={{ margin: 0 }}><a href="#">Projects</a><span className="sep">/</span><a href="#">TAMA</a><span className="sep">/</span><span aria-current="page">Allocation</span></nav>
        </div>
      </Block>

      <Block name="Tags and status" use="Today's chips, unchanged. The Locked tag disappears for anyone who has unlocked the work.">
        <div className="sys-demo sys-row">
          <span className="tag t-label">Locked</span>
          <span className="chip live t-label"><i />Live</span>
          <span className="chip built t-label"><i />Built</span>
          <span className="chip wip t-label"><i />In progress</span>
          <span className="chip past t-label"><i />Past</span>
        </div>
      </Block>

      <Block name="Buttons" use="Monospace capitals.">
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

      <Block name="Project rows" use="Point at a row: the name turns gold and the thumbnail takes its colour, without moving. Thumbnails have 2px corners.">
        <div className="sys-demo">
          <ul className="rows">
            <li><a className="row" href="#"><Thumb kind="tama" /><span><span className="row-name"><span className="nm">TAMA</span></span><span className="row-line">Tax audit management for a state revenue authority</span></span><span className="row-year num">2025–26</span></a></li>
            <li><a className="row" href="#"><Thumb kind="kita" /><span><span className="row-name"><span className="nm">Kita</span></span><span className="row-line">The platform an energy company runs its operations on</span></span><span className="row-year num">2024–26</span></a></li>
            <li><a className="row" href="#"><Thumb kind="brydge" /><span><span className="row-name"><span className="nm">Brydge</span></span><span className="row-line">Payments for a cross-border trade platform</span></span><span className="row-year num">2024</span></a></li>
          </ul>
        </div>
      </Block>

      <Block name="Key and value" use="Me, Kit and the case-study details. Stacked in the details column and on phones.">
        <div className="sys-pair">
          <div className="sys-demo">
            <dl className="kv">
              <div><dt className="t-label">Reading</dt><dd>Thinking in Systems</dd></div>
              <div><dt className="t-label">Listening</dt><dd>What&rsquo;s in the footer</dd></div>
              <div><dt className="t-label">Learning</dt><dd>Writing shorter</dd></div>
            </dl>
          </div>
          <div className="sys-demo">
            <dl className="kv stack">
              <div><dt className="t-label">Role</dt><dd>Product Designer (Lead)</dd></div>
              <div><dt className="t-label">Timeline</dt><dd>Nov 25 – Apr 26</dd></div>
              <div><dt className="t-label">Status</dt><dd><span className="chip built t-label"><i />Built</span><span className="ink-2" style={{ display: 'block', marginTop: 'var(--sp-1)' }}>Rolls out next audit cycle</span></dd></div>
            </dl>
          </div>
        </div>
      </Block>

      <Block name="Reading" use="A case-study head, then sections: a heading and copy.">
        <div className="sys-demo">
          <div className="eyebrow t-label"><span>TAMA</span><span>2025–26</span><span className="tag">Locked</span></div>
          <h3 className="t-display">Making every tax audit visible, from planning to assessment</h3>
          <p className="lede">A state tax authority audits its largest taxpayers through a long chain of reviews. I designed the system that carries every audit through it.</p>
          <section className="sec">
            <h2 className="t-heading">Nobody could see where an audit stood</h2>
            <div className="copy">
              <p>Progress lived in spreadsheets updated by hand every week or two, so the people accountable for audits couldn&rsquo;t tell which cases were moving and which were stuck.</p>
              <p>In TAMA, <strong>every case carries its stage</strong>, and every role sees the cases in its hands.</p>
            </div>
          </section>
        </div>
      </Block>

      <Block name="Screens" use="One screen with a caption, or a loop of screens.">
        <div className="sys-demo">
          <figure className="fig" style={{ margin: 0 }}><div className="ph t-label">Screen</div><figcaption className="t-small">An audit manager creates the case and assigns the team in one step.</figcaption></figure>
        </div>
        <div className="sys-demo">
          <figure style={{ margin: 0 }}>
            <div className="loop-stage" />
            <figcaption className="loop-cap"><span className="ticks"><i className="done" /><i className="on" /><i /><i /></span><span className="t-label"><span>02</span><span>The approval pipeline</span></span></figcaption>
          </figure>
        </div>
      </Block>

      <Block name="Steps" use="Smaller and tighter. A dot fills when you reach it and stays filled when you scroll back up.">
        <div className="sys-demo">
          <ol className="steps" style={{ margin: 0 }}>
            <li className="phase t-label">Allocation</li>
            <li className="step on"><span className="dot">01</span><span><span className="t-strong">Create</span><span className="who">Audit manager</span><span className="what">Creates the case and assigns the auditors.</span></span></li>
            <li className="step on"><span className="dot">02</span><span><span className="t-strong">Approve</span><span className="who">Audit executive</span><span className="what">Approves the allocation; both auditors are notified.</span></span></li>
            <li className="phase t-label">Review</li>
            <li className="step"><span className="dot">03</span><span><span className="t-strong">Vetting</span><span className="who">Review officers</span><span className="tag t-label">Can send back</span><span className="what">Each officer re-computes the figures in turn.</span></span></li>
          </ol>
        </div>
      </Block>

      <Block name="Impact" use="What changed for the people using it: the figure now, what it was, what it measures. Placeholder figures.">
        <div className="sys-demo">
          <div className="stats" style={{ margin: 0 }}>
            <div className="stat"><b>Live</b><span className="was t-small">Every 1–2 weeks</span><span className="what t-small">How current an audit&rsquo;s status is</span></div>
            <div className="stat"><b className="num">1</b><span className="was t-small">4 tools</span><span className="what t-small">Places an audit lives</span></div>
            <div className="stat"><b className="num">0</b><span className="was t-small">Email threads</span><span className="what t-small">Approvals outside the system</span></div>
          </div>
        </div>
      </Block>

      <Block name="Modules" use="Listed on the project page; each opens its own page, with the breadcrumb at the top.">
        <div className="sys-demo">
          <ul className="mods">
            <li><a href="#"><span className="t-label">01</span><span><span className="nm">Setup</span><span className="ln">Cycles, windows and the documents every audit needs</span></span><Icon name="arrow-right" size={14} /></a></li>
            <li><a href="#"><span className="t-label">02</span><span><span className="nm">Allocation</span><span className="ln">Creating cases and approving their teams</span></span><Icon name="arrow-right" size={14} /></a></li>
            <li><a href="#"><span className="t-label">03</span><span><span className="nm">Review</span><span className="ln">Three units check every report in turn</span></span><Icon name="arrow-right" size={14} /></a></li>
          </ul>
        </div>
        <div className="sys-demo">
          <nav className="crumbs t-small" aria-label="Breadcrumb"><a href="#">Projects</a><span className="sep">/</span><a href="#">TAMA</a><span className="sep">/</span><span aria-current="page">Allocation</span></nav>
          <h3 className="t-display">Creating cases and approving their teams</h3>
          <p className="lede">Audit managers create cases and assign a team; the audit executive approves. Everything after hangs off that handshake.</p>
          <figure className="fig" style={{ marginBottom: 0 }}><div className="ph t-label">Screen</div><figcaption className="t-small">Creating a case and assigning its team.</figcaption></figure>
        </div>
      </Block>

      <Block name="Previous and next" use="Thumbnail and name only. The first project has no previous, the last no next.">
        <div className="sys-demo">
          <nav className="pn" aria-label="Example" style={{ margin: 0 }}>
            <a className="pv" href="#"><span className="t-label">Previous</span><span className="pn-r"><Thumb kind="tama" /><span className="nm">TAMA</span></span></a>
            <a className="nx" href="#"><span className="t-label">Next</span><span className="pn-r"><span className="nm">Brydge</span><Thumb kind="brydge" /></span></a>
          </nav>
        </div>
      </Block>

      <Block name="Field" use="The password for locked work.">
        <div className="sys-demo">
          <div className="field"><Icon name="key" size={16} /><input type="password" placeholder="Password" aria-label="Password" /><button className="btn icon" type="button" aria-label="Unlock"><Icon name="arrow-right" size={16} /></button></div>
          <p className="t-small ink-3" style={{ margin: 'var(--sp-1) 0 0' }}>Ask me for the password.</p>
        </div>
      </Block>

      <Block name="Footer bar" use="Always dark: the name on the left, the switches in the middle, what I'm listening to on the right. Opens with Emmanuel Hong's gesture; the page's corners round to 24.5px as it lifts.">
        <div className="bar t-small">
          <span>© Oluwatimilehin Odunlami 2026</span>
          <div className="seg" role="radiogroup" aria-label="Theme">
            <button type="button" role="radio" aria-checked="true" aria-label="System"><Icon name="monitor" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Light"><Icon name="sun" size={16} /></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Dark"><Icon name="moon" size={16} /></button>
          </div>
          <span className="fi end"><Icon name="music" size={14} />Nothing playing</span>
        </div>
      </Block>
    </main>
  );
}
