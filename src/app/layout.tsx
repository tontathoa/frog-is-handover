import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  icons: {
    icon: [
      { url: '/img/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/img/favicon-192.png',
  },
};

export const viewport: Viewport = { themeColor: '#000000' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
