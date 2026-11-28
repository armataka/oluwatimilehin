import Markdoc, { type RenderableTreeNodes } from '@markdoc/markdoc';
import React from 'react';
import { Loop } from './Loop';

type Step = { phase?: string; stage: string; who: string; what: string; sendsBack?: boolean };

function Figure({ src, label, caption, ratio = '16 / 10' }: { src?: string; label?: string; caption?: string; ratio?: string }) {
  return (
    <figure className="fig">
      {src ? (
        <img className="zoom" src={src} alt={label ?? ''} loading="lazy" decoding="async" />
      ) : (
        <div className="ph" style={{ aspectRatio: ratio }} role="img" aria-label={`Placeholder for ${label}`}>{label}</div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Steps({ items = [] }: { items: Step[] }) {
  return (
    <ol className="steps" aria-label="The stages of an audit">
      {items.map((s, i) => (
        <React.Fragment key={i}>
          {s.phase ? <li className="phase" aria-hidden="true">{s.phase}</li> : null}
          <li className="step">
            <span className="dot">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="t-strong">{s.stage}</span>
              <span className="who">{s.who}</span>
              {s.sendsBack ? <span className="tag">Can send back</span> : null}
              <span className="what">{s.what}</span>
            </span>
          </li>
        </React.Fragment>
      ))}
    </ol>
  );
}

function Stats({ items = [] }: { items: { value: string; label: string; was?: string }[] }) {
  return (
    <div className="stats">
      {items.map((s, i) => (<div key={i} className="stat"><b>{s.value}</b>{s.was ? <span className="was t-small">{s.was}</span> : null}<span className="what t-small">{s.label}</span></div>))}
    </div>
  );
}

function Modules({ items = [] }: { items: { name: string; description: string }[] }) {
  return (
    <ul className="mods">
      {items.map((m, i) => (<li key={i}><div className="mod-i"><span className="t-label">{String(i + 1).padStart(2, '0')}</span><span><span className="nm">{m.name}</span><span className="ln">{m.description}</span></span></div></li>))}
    </ul>
  );
}

export function Prose({ content }: { content: RenderableTreeNodes }) {
  // drop Markdoc's wrapping <article> so each paragraph, heading and figure reveals on its own
  const nodes = Markdoc.Tag.isTag(content) && content.name === 'article' ? content.children : content;
  return <>{Markdoc.renderers.react(nodes, React, { components: { Figure, Steps, Stats, Modules, Loop, Locked: () => null } })}</>;
}
