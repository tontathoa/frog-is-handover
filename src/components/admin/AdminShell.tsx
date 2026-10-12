'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { api } from './api';

type Item = { label: string; href: string; icon: ReactNode; exact?: boolean; external?: boolean; countKey?: 'unread' };
type Section = { title?: string; items: Item[] };

const icon = (paths: ReactNode) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
);

const MENU: Section[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/admin/',
        exact: true,
        icon: icon(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>),
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Collections', href: '/admin/collections/', icon: icon(<><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>) },
      { label: 'Products', href: '/admin/products/', icon: icon(<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>) },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Posts', href: '/admin/posts/', icon: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>) },
      { label: 'Application videos', href: '/admin/videos/', icon: icon(<><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></>) },
      { label: 'Downloads', href: '/admin/downloads/', icon: icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>) },
    ],
  },
  {
    title: 'Contact',
    items: [{ label: 'Messages', href: '/admin/messages/', countKey: 'unread', icon: icon(<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />) }],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Settings',
        href: '/admin/settings/',
        icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>),
      },
    ],
  },
  {
    title: 'Website',
    items: [{ label: 'View site', href: '/', external: true, icon: icon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14L21 3" /></>) }],
  },
];

type Props = {
  user: { fullName: string; role: string };
  unread: number;
  children: ReactNode;
};

export default function AdminShell({ user, unread, children }: Props) {
  const pathname = usePathname().replace(/\/?$/, '/');
  const router = useRouter();

  const logout = async () => {
    await api.post('auth/logout').catch(() => undefined);
    router.replace('/admin/login/');
    router.refresh();
  };

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <span className="adm-sidebar__logo">
            <img src="/img/logo.png" alt="Frog-is" width={452} height={300} />
          </span>
          <div className="adm-sidebar__tag">Admin Panel</div>
        </div>

        <nav className="adm-sidebar__nav" aria-label="Admin">
          {MENU.map((section, index) => (
            <div key={section.title ?? index} style={{ display: 'contents' }}>
              {section.title && <div className="adm-sidebar__section">{section.title}</div>}
              {section.items.map((item) => {
                const active = !item.external && (item.exact ? pathname === item.href : pathname.startsWith(item.href));
                const count = item.countKey === 'unread' ? unread : 0;
                const content = (
                  <>
                    {item.icon}
                    {item.label}
                    {count > 0 && <span className="adm-sidebar__count">{count > 99 ? '99+' : count}</span>}
                  </>
                );
                return item.external ? (
                  <a key={item.href} className="adm-sidebar__link" href={item.href} target="_blank" rel="noopener">
                    {content}
                  </a>
                ) : (
                  <Link key={item.href} className={`adm-sidebar__link${active ? ' is-active' : ''}`} href={item.href} aria-current={active ? 'page' : undefined}>
                    {content}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar__user">
          <div className="adm-user">
            <div className="adm-user__avatar" aria-hidden="true">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="adm-user__name">{user.fullName}</div>
              <div className="adm-user__role">{user.role}</div>
            </div>
          </div>
          <div className="adm-user__actions">
            <Link href="/admin/account/">Change password</Link>
            <button type="button" onClick={logout}>
              Sign out →
            </button>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-content">{children}</div>
      </main>
    </div>
  );
}
