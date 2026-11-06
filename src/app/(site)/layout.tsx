import Script from 'next/script';
import type { ReactNode } from 'react';
import '../globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { site } from '@/config/site';
import { getCollections, getContactInfo, getSocials } from '@/lib/content';
import { mediaUrl } from '@/lib/format';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [collections, info, socials] = await Promise.all([getCollections(), getContactInfo(), getSocials()]);
  const gtmId = site.noindex ? '' : site.gtmId;

  return (
    <>
      {gtmId && (
        <>
          {/* Google Tag Manager, the standard container snippet (also defines gtag()) */}
          <Script id="gtm">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
var s = document.createElement('script'); s.async = true;
s.src = 'https://www.googletagmanager.com/gtm.js?id=${gtmId}';
document.head.appendChild(s);`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
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
