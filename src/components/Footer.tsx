import Link from 'next/link';
import NewsletterForm from './NewsletterForm';
import { site } from '@/config/site';
import type { Collection, ContactInfo, Social } from '@/lib/types';

const SOCIAL_NAMES: Record<string, string> = { 'facebook-f': 'Facebook', facebook: 'Facebook', instagram: 'Instagram', twitter: 'X', 'linkedin-in': 'LinkedIn', linkedin: 'LinkedIn', youtube: 'YouTube' };

export default function Footer({ collections, info, socials }: { collections: Collection[]; info: ContactInfo; socials: Social[] }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/img/logo.png" alt={site.name} width={452} height={300} loading="lazy" />
          <p>{site.tagline}</p>
        </div>

        <div className="site-footer__col">
          <h2>Products</h2>
          <ul>
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collection/${c.slug}/`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h2>Frog-is</h2>
          <ul>
            <li><Link href="/about-us/">About us</Link></li>
            <li><Link href="/applications/">Applications</Link></li>
            <li><Link href="/news/">News &amp; projects</Link></li>
            <li><Link href="/brochure/">Download</Link></li>
            <li><Link href="/contact/">Contact us</Link></li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h2>Contact</h2>
          <ul>
            {info.address.length > 0 && <li>{info.address.join(' ')}</li>}
            {info.phones.map((phone) => (
              <li key={phone.number}>
                {phone.label}: <a href={`tel:${phone.number.replace(/[^+\d]/g, '')}`}>{phone.number}</a>
              </li>
            ))}
            {info.emails.map((mail) => (
              <li key={mail.email}>
                <a href={`mailto:${mail.email}`}>{mail.email}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col site-footer__col--wide" id="newsletter">
          <h2>Newsletter</h2>
          <NewsletterForm />
          {socials.length > 0 && (
            <ul className="socials">
              {socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noopener">
                    {SOCIAL_NAMES[social.network] ?? social.network}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} Frog-Is. All rights reserved.</span>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
