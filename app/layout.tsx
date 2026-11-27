import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://oluwatimilehin.me'),
  title: 'Oluwatimilehin Odunlami, product designer',
  description: 'Oluwatimilehin Odunlami, product designer for operational software. Tax audits, logistics, contracts: work where a wrong number has consequences.',
};

// Runs before first paint: theme choice, and whether to play the name on a first visit.
const boot = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}document.documentElement.classList.add('js');try{if(!location.pathname.startsWith('/keystatic')&&(function(){var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload')return true;if(n&&n.type==='back_forward')return false;try{return !document.referrer||new URL(document.referrer).origin!==location.origin}catch(e){return true}})()&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('loading')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
