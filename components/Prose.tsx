import Markdoc, { type RenderableTreeNodes } from '@markdoc/markdoc';
import React from 'react';
import { Icon } from './Icon';
import { Gallery } from './Gallery';
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
          <li className="st">
            <span className="dot">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="stg">{s.stage}</span>
              <span className="who">{s.who}</span>
              <span className="what">{s.what}</span>
              {s.sendsBack ? <span className="ret"><Icon name="corner-down-left" size={12} />Can send it back</span> : null}
            </span>
          </li>
        </React.Fragment>
      ))}
    </ol>
  );
}

function Stats({ items = [] }: { items: { value: string; label: string }[] }) {
  return (
    <div className="stats">
      {items.map((s, i) => (<div key={i}><b>{s.value}</b><span>{s.label}</span></div>))}
    </div>
  );
}

function Modules({ items = [] }: { items: { name: string; description: string }[] }) {
  return (
    <div className="mods">
      {items.map((m, i) => (<div key={i}><b>{m.name}</b><span className="s2">{m.description}</span></div>))}
    </div>
  );
}

export function Prose({ content }: { content: RenderableTreeNodes }) {
  // drop Markdoc's wrapping <article> so each paragraph, heading and figure reveals on its own
  const nodes = Markdoc.Tag.isTag(content) && content.name === 'article' ? content.children : content;
  return <>{Markdoc.renderers.react(nodes, React, { components: { Figure, Steps, Stats, Modules, Gallery, Loop, Locked: () => null } })}</>;
}
