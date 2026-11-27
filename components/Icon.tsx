import { icons } from '@/lib/icons';

export function Icon({ name, size = 16, className = '', label }: { name: string; size?: number; className?: string; label?: string }) {
  return (
    <svg
      className={`px ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: icons[name] ?? '' }}
    />
  );
}
