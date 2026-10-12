import type { ReactNode } from 'react';
import '../globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { site } from '@/config/site';
import { getCollections, getContactInfo, getSocials } from '@/lib/content';
import { mediaUrl } from '@/lib/format';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [collections, info, socials] = await Promise.all([getCollections(), getContactInfo(), getSocials()]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        name={site.name}
        tagline={site.tagline}
        nav={site.nav}
        collections={collections.map((c) => ({
          slug: c.slug,
          name: c.name,
          icon: mediaUrl(c.icon),
          iconHover: mediaUrl(c.iconHover),
          count: c.productCount,
        }))}
      />
      <main id="main">{children}</main>
      <Footer collections={collections} info={info} socials={socials} />
    </>
  );
}
