'use client';

import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { lineHref, PRODUCT_LINES } from '@/lib/lines';

type NavItem = { label: string; path: string; mega?: boolean };
type NavCollection = { slug: string; name: string; icon: string; iconHover: string; count: number };

type Props = {
  name: string;
  tagline: string;
  nav: NavItem[];
  collections: NavCollection[];
};

export default function Header({ name, tagline, nav, collections }: Props) {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  // After a click inside the panel the pointer still hovers it; keep it shut until the pointer leaves.
  const [megaSuppressed, setMegaSuppressed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const megaTrigger = useRef<HTMLAnchorElement>(null);
  const megaPanel = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  const current = pathname.replace(/^\/+/, '').replace(/\/?$/, '/');
  const isActive = (path: string) =>
    current !== '/' &&
    (current.startsWith(path) ||
      (path === 'products/' && /^(collection|product)\//.test(current)) ||
      (path === 'applications/' && current.startsWith('video/')));

  const closeAll = () => {
    setMegaOpen(false);
    setSearchOpen(false);
    setDrawerOpen(false);
  };
  // a link inside the panel was used: close it and keep it shut until the pointer leaves
  const leaveMega = () => {
    closeAll();
    setMegaSuppressed(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMegaOpen((open) => {
        if (open) megaTrigger.current?.focus();
        return false;
      });
      setSearchOpen(false);
      setDrawerOpen(false);
    };
    const wide = window.matchMedia('(min-width: 961px)');
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="site-header__logo" href="/" aria-label={`${name} — home`} onClick={closeAll}>
          <img src="/img/logo.png" alt={name} width={452} height={300} />
        </Link>

        <nav className="site-nav" aria-label="Main">
          {nav.map((item) =>
            item.mega ? (
              <div
                key={item.path}
                className={`site-nav__group${megaOpen ? ' is-open' : ''}${megaSuppressed ? ' is-suppressed' : ''}`}
                onMouseLeave={() => setMegaSuppressed(false)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setMegaOpen(false);
                }}
              >
                <Link
                  ref={megaTrigger}
                  className={`site-nav__link${isActive(item.path) ? ' is-active' : ''}`}
                  href={`/${item.path}`}
                  aria-haspopup="true"
                  aria-expanded={megaOpen}
                  onClick={(event) => {
                    // Touch: the first tap opens the panel, the second follows the link.
                    if (!window.matchMedia('(hover: hover)').matches && !megaOpen) {
                      event.preventDefault();
                      setMegaOpen(true);
                      return;
                    }
                    closeAll();
                    setMegaSuppressed(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === ' ') {
                      event.preventDefault();
                      setMegaOpen(true);
                      requestAnimationFrame(() => megaPanel.current?.querySelector('a')?.focus());
                    }
                  }}
                >
                  {item.label}
                  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </Link>
                <div className="mega" ref={megaPanel}>
                  <div className="mega__lines">
                    {PRODUCT_LINES.map((line) => (
                      <Link key={line.value} className="mega__line" href={lineHref(line.value)} onClick={leaveMega}>
                        <Image src={line.photo} alt="" width={168} height={126} />
                        <span className="mega__linetext">
                          <span className="mega__name">{line.label}</span>
                          <span className="mega__count">{line.tagline}</span>
                        </span>
                        <span className="mega__arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mega__inner">
                    {collections.map((c) => (
                      <Link key={c.slug} className="mega__item" href={`/collection/${c.slug}/`} onClick={leaveMega}>
                        <span className="mega__icon">
                          {c.icon && <img src={c.icon} alt="" loading="lazy" width={95} height={90} />}
                          {c.iconHover && <img className="is-hover" src={c.iconHover} alt="" loading="lazy" width={95} height={90} />}
                        </span>
                        <span className="mega__name">{c.name}</span>
                        <span className="mega__count">{c.count} products</span>
                      </Link>
                    ))}
                  </div>
                  <Link className="mega__all" href="/products/" onClick={leaveMega}>
                    All products <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                key={item.path}
                className={`site-nav__link${isActive(item.path) ? ' is-active' : ''}`}
                href={`/${item.path}`}
                onClick={closeAll}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <Link className="site-header__claim" href="/about-us/" onClick={closeAll}>
          {tagline}
        </Link>

        <button
          className="icon-btn"
          type="button"
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={() => {
            setDrawerOpen(false);
            setSearchOpen((open) => !open);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M13.5 13.5L19 19" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          className="icon-btn site-header__burger"
          type="button"
          aria-label="Menu"
          aria-expanded={drawerOpen}
          onClick={() => {
            setSearchOpen(false);
            setDrawerOpen((open) => !open);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {searchOpen && (
        <Form className="search-panel" action="/search/" role="search" onSubmit={() => setSearchOpen(false)}>
          <label className="sr-only" htmlFor="site-search">
            Search products and news
          </label>
          <input ref={searchInput} id="site-search" type="search" name="s" placeholder="Search products, news…" autoComplete="off" />
          <button className="btn btn--light" type="submit">
            Search
          </button>
        </Form>
      )}

      {drawerOpen && (
        <div className="drawer">
          <nav className="drawer__nav" aria-label="Mobile">
            {nav.map((item) => (
              <div key={item.path}>
                <Link className="drawer__link" href={`/${item.path}`} onClick={closeAll}>
                  {item.label}
                </Link>
                {item.mega && (
                  <div className="drawer__lines">
                    {PRODUCT_LINES.map((line) => (
                      <Link key={line.value} href={lineHref(line.value)} onClick={closeAll}>
                        <Image src={line.photo} alt="" width={144} height={108} />
                        <span>
                          {line.label}
                          <small>{line.tagline}</small>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {item.mega && (
                  <div className="drawer__sub">
                    {collections.map((c) => (
                      <Link key={c.slug} href={`/collection/${c.slug}/`} onClick={closeAll}>
                        {c.icon && <img src={c.icon} alt="" loading="lazy" width={95} height={90} />}
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
