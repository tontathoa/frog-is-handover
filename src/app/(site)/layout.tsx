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
  const metaPixelId = site.noindex ? '' : site.metaPixelId;

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
      {metaPixelId && (
        <>
          {/* Meta Pixel, the standard base code; fbevents.js also sends PageView on client-side navigation */}
          <Script id="meta-pixel">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
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
