'use client';

import { useEffect, useState } from 'react';
import { api, errorText } from './api';
import { Field, Loading, PageHead, Saved, Tabs, useFlash } from './ui';
import { ImageUpload } from './uploads';

type Contact = { intro: string; address: string[]; phones: { label: string; number: string }[]; emails: { label: string; email: string }[] };
type Social = { network: string; href: string };
type Slide = { image: string; title: string; text: string; cta: string; href: string };
type Settings = { contact: Contact; socials: Social[]; slides: Slide[] };

const TABS = [
  { id: 'contact', label: '📞 Contact' },
  { id: 'socials', label: '🌐 Social networks' },
  { id: 'slides', label: '🖼 Home page slides' },
];
const NETWORKS = ['facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'tiktok', 'wechat'];

export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [saved, flash] = useFlash();

  useEffect(() => {
    api
      .get<Settings>('settings')
      .then(setSettings)
      .catch((failure) => setError(errorText(failure)));
  }, []);

  if (error && !settings) return <div className="adm-error">{error}</div>;
  if (!settings) return <Loading />;

  const { contact, socials, slides } = settings;
  const setContact = (patch: Partial<Contact>) => setSettings({ ...settings, contact: { ...contact, ...patch } });
  const setSocials = (next: Social[]) => setSettings({ ...settings, socials: next });
  const setSlides = (next: Slide[]) => setSettings({ ...settings, slides: next });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('settings', settings);
      flash('Settings saved');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  const moveSlide = (index: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const next = [...slides];
    [next[index], next[to]] = [next[to], next[index]];
    setSlides(next);
  };

  return (
    <>
      <PageHead title="Settings" sub="Contact details, social networks and home page slides">
        <Saved message={saved} />
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving} onClick={save}>
          {saving ? 'Saving...' : '💾 Save settings'}
        </button>
      </PageHead>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {error && <div className="adm-error">{error}</div>}

      {tab === 'contact' && (
        <div className="adm-card">
          <h2 className="adm-section-title">Contact details</h2>
          <div className="adm-grid">
            <Field label="Contact page introduction" full>
              <textarea className="adm-input" rows={2} value={contact.intro} onChange={(event) => setContact({ intro: event.target.value })} />
            </Field>
            <Field label="Address" full hint="One address line per row">
              <textarea className="adm-input" rows={3} value={contact.address.join('\n')} onChange={(event) => setContact({ address: event.target.value.split('\n') })} />
            </Field>
          </div>

          <h2 className="adm-section-title" style={{ marginTop: 28 }}>
            Phone
          </h2>
          <div className="adm-rows">
            {contact.phones.map((phone, index) => (
              <div key={index} className="adm-row">
                <input
                  className="adm-input adm-input--sm"
                  style={{ maxWidth: 200 }}
                  aria-label="Label"
                  placeholder="Label (Office, Hong Kong...)"
                  value={phone.label}
                  onChange={(event) => setContact({ phones: contact.phones.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)) })}
                />
                <input
                  className="adm-input adm-input--sm"
                  aria-label="Phone number"
                  placeholder="+86 574 8757 6644"
                  value={phone.number}
                  onChange={(event) => setContact({ phones: contact.phones.map((item, i) => (i === index ? { ...item, number: event.target.value } : item)) })}
                />
                <button type="button" className="adm-row__remove" aria-label="Delete phone number" onClick={() => setContact({ phones: contact.phones.filter((_, i) => i !== index) })}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="adm-link" style={{ marginTop: 12 }} onClick={() => setContact({ phones: [...contact.phones, { label: '', number: '' }] })}>
            + Add phone number
          </button>

          <h2 className="adm-section-title" style={{ marginTop: 28 }}>
            Email
          </h2>
          <div className="adm-rows">
            {contact.emails.map((mail, index) => (
              <div key={index} className="adm-row">
                <input
                  className="adm-input adm-input--sm"
                  style={{ maxWidth: 200 }}
                  aria-label="Label"
                  placeholder="Label (Sales, Support...)"
                  value={mail.label}
                  onChange={(event) => setContact({ emails: contact.emails.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)) })}
                />
                <input
                  className="adm-input adm-input--sm"
                  type="email"
                  aria-label="Email"
                  placeholder="sales@frog-is.com"
                  value={mail.email}
                  onChange={(event) => setContact({ emails: contact.emails.map((item, i) => (i === index ? { ...item, email: event.target.value } : item)) })}
                />
                <button type="button" className="adm-row__remove" aria-label="Delete email" onClick={() => setContact({ emails: contact.emails.filter((_, i) => i !== index) })}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="adm-link" style={{ marginTop: 12 }} onClick={() => setContact({ emails: [...contact.emails, { label: '', email: '' }] })}>
            + Add email
          </button>
        </div>
      )}

      {tab === 'socials' && (
        <div className="adm-card">
          <h2 className="adm-section-title">Social network links (footer)</h2>
          <div className="adm-rows">
            {socials.map((social, index) => (
              <div key={index} className="adm-row">
                <select
                  className="adm-input adm-input--sm"
                  style={{ maxWidth: 160 }}
                  aria-label="Social network"
                  value={social.network}
                  onChange={(event) => setSocials(socials.map((item, i) => (i === index ? { ...item, network: event.target.value } : item)))}
                >
                  {[...new Set([social.network, ...NETWORKS])].filter(Boolean).map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
                <input
                  className="adm-input adm-input--sm"
                  aria-label="Link URL"
                  placeholder="https://..."
                  value={social.href}
                  onChange={(event) => setSocials(socials.map((item, i) => (i === index ? { ...item, href: event.target.value } : item)))}
                />
                <button type="button" className="adm-row__remove" aria-label="Delete link" onClick={() => setSocials(socials.filter((_, i) => i !== index))}>
                  ✕
                </button>
              </div>
            ))}
            {socials.length === 0 && <p className="adm-muted">No links yet.</p>}
          </div>
          <button type="button" className="adm-link" style={{ marginTop: 12 }} onClick={() => setSocials([...socials, { network: 'facebook', href: '' }])}>
            + Add link
          </button>
        </div>
      )}

      {tab === 'slides' && (
        <>
          {slides.map((slide, index) => (
            <div key={index} className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">Slide {index + 1}</h2>
                <div className="adm-acts">
                  <button type="button" className="adm-act adm-act--view" disabled={index === 0} aria-label="Move up" onClick={() => moveSlide(index, index - 1)}>
                    ↑
                  </button>
                  <button type="button" className="adm-act adm-act--view" disabled={index === slides.length - 1} aria-label="Move down" onClick={() => moveSlide(index, index + 1)}>
                    ↓
                  </button>
                  <button type="button" className="adm-act adm-act--del" onClick={() => window.confirm('Delete this slide?') && setSlides(slides.filter((_, i) => i !== index))}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="adm-grid">
                <div className="adm-group">
                  <span className="adm-label">Background image (landscape, min. 1920px)</span>
                  <ImageUpload value={slide.image} onChange={(path) => setSlides(slides.map((item, i) => (i === index ? { ...item, image: path } : item)))} aspect="16 / 6" />
                </div>
                <div className="adm-group" style={{ gap: 12 }}>
                  <Field label="Title">
                    <input className="adm-input" value={slide.title} onChange={(event) => setSlides(slides.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)))} />
                  </Field>
                  <Field label="Description line">
                    <input className="adm-input" value={slide.text} onChange={(event) => setSlides(slides.map((item, i) => (i === index ? { ...item, text: event.target.value } : item)))} />
                  </Field>
                  <div className="adm-grid">
                    <Field label="Button text">
                      <input className="adm-input" value={slide.cta} onChange={(event) => setSlides(slides.map((item, i) => (i === index ? { ...item, cta: event.target.value } : item)))} />
                    </Field>
                    <Field label="Button links to" hint="Example: /products/">
                      <input className="adm-input a-mono" value={slide.href} onChange={(event) => setSlides(slides.map((item, i) => (i === index ? { ...item, href: event.target.value } : item)))} />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p style={{ marginTop: 16 }}>
            <button type="button" className="adm-link" onClick={() => setSlides([...slides, { image: '', title: '', text: '', cta: '', href: '' }])}>
              + Add slide
            </button>{' '}
            <span className="adm-hint">— slides without an image will not be saved.</span>
          </p>
        </>
      )}
    </>
  );
}
