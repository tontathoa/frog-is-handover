import { Suspense } from 'react';
import ContactForm from '@/components/ContactForm';
import { getContactInfo } from '@/lib/content';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({
  title: 'Contact',
  description: 'Contact Frog-is: sales, technical support and Hong Kong office.',
  path: '/contact/',
});

export default async function ContactPage() {
  const info = await getContactInfo();
  return (
    <>
      <div className="page-head">
        <h1 className="display">Contact</h1>
        {info.intro && <p className="page-head__lead">{info.intro}</p>}
      </div>

      <section className="section section--narrow">
        <div className="contact">
          <div className="contact__info">
            {info.address.length > 0 && (
              <div className="contact__block">
                <h2 className="label">Company address</h2>
                <p>
                  {info.address.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < info.address.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {info.phones.length > 0 && (
              <div className="contact__block">
                <h2 className="label">Phone</h2>
                {info.phones.map((phone) => (
                  <p key={phone.number}>
                    {phone.label}: <a href={`tel:${phone.number.replace(/[^+\d]/g, '')}`}>{phone.number}</a>
                  </p>
                ))}
              </div>
            )}
            {info.emails.map((mail) => (
              <div key={mail.email} className="contact__block">
                <h2 className="label">{mail.label}</h2>
                <p>
                  <a className="contact__mail" href={`mailto:${mail.email}`}>
                    {mail.email}
                  </a>
                </p>
              </div>
            ))}
          </div>

          <div className="contact__form">
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
