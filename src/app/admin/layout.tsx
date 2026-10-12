import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Quản trị', template: '%s — Frog-is Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="adm">{children}</div>;
}
