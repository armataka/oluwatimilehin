'use client';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Highlights', match: (p: string) => p === '/' || p.startsWith('/work') || p.startsWith('/gallery') },
  { href: '/me', label: 'Me', match: (p: string) => p.startsWith('/me') },
  { href: '/kit', label: 'Kit', match: (p: string) => p.startsWith('/kit') },
];

export function Nav() {
  const path = usePathname() ?? '/';
  return (
    <nav className="nav" aria-label="Main">
      {items.map((n) => (
        <a key={n.href} href={n.href} aria-current={n.match(path) ? 'page' : undefined}>{n.label}</a>
      ))}
    </nav>
  );
}
