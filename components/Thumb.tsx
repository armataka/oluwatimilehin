// A tiny screen, in each product's own colours, until real crops replace it.
export function Thumb({ kind, src }: { kind: string; src?: string | null }) {
  if (src) return <img className="thumb img" src={src} alt="" aria-hidden="true" />;
  return (
    <span className={`thumb ${kind}`} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}
