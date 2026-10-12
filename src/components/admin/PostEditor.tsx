'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RichEditor from './RichEditor';
import { api, errorText } from './api';
import { Field, Loading, Saved, Tabs, dateVN, mediaSrc, useFlash } from './ui';
import { ImageUpload } from './uploads';

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  isPublished: boolean;
  /** datetime-local value: "2026-10-11T09:30" */
  publishedAt: string;
};
type Loaded = Omit<Form, 'image'> & { image: string | null };

const pad = (value: number) => String(value).padStart(2, '0');
const nowLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

const forEditing = (html: string) => html.replaceAll('{{site}}', '/').replace(/(src|href)="uploads\//g, '$1="/uploads/');
const plainLength = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length;

const TABS = [
  { id: 'basic', label: '📝 Details' },
  { id: 'content', label: '✍️ Content' },
  { id: 'preview', label: '👁 Preview' },
];

export default function PostEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>({ title: '', slug: '', excerpt: '', content: '', image: '', isPublished: false, publishedAt: '' });
  const [loading, setLoading] = useState(id !== null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [saved, flash] = useFlash();
  const isNew = id === null;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (id === null) return;
    api
      .get<Loaded>(`posts/${id}`)
      .then((post) =>
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: forEditing(post.content),
          image: post.image ?? '',
          isPublished: post.isPublished,
          publishedAt: post.publishedAt.replace(' ', 'T').slice(0, 16),
        }),
      )
      .catch((failure) => setLoadError(errorText(failure)))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      setTab('basic');
      window.alert('Please enter a title');
      return;
    }
    if (!isNew && !form.slug.trim()) {
      setTab('basic');
      window.alert('Slug cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, isPublished: publish, publishedAt: form.publishedAt || nowLocal() };
      if (isNew) {
        const created = await api.post<{ id: number }>('posts', body);
        router.replace(`/admin/posts/${created.id}/`);
        return;
      }
      await api.put(`posts/${id}`, body);
      setForm((current) => ({ ...current, isPublished: publish, publishedAt: body.publishedAt }));
      flash(publish ? 'Post published' : 'Draft saved');
    } catch (failure) {
      window.alert(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <div className="adm-error">{loadError}</div>;

  return (
    <>
      <div className="adm-head adm-head--editor">
        <button type="button" className="adm-back" aria-label="Back to list" onClick={() => router.push('/admin/posts/')}>
          ←
        </button>
        <h1>{isNew ? 'Add new post' : form.title || 'Post'}</h1>
        <Saved message={saved} />
        <span className={`adm-badge ${form.isPublished ? 'adm-badge--green' : 'adm-badge--gray'}`}>{form.isPublished ? '🟢 Published' : '⚪ Draft'}</span>
        <button type="button" className="adm-btn adm-btn--outline adm-btn--sm" disabled={saving} onClick={() => save(false)}>
          {form.isPublished ? '↩ Revert to draft' : '💾 Save draft'}
        </button>
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving} onClick={() => save(true)}>
          {saving ? 'Saving...' : form.isPublished ? '💾 Save changes' : '🚀 Publish'}
        </button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'basic' && (
        <div className="adm-card">
          <div className="adm-grid">
            <Field label="Title *" full>
              <input
                className="adm-input adm-input--title"
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((current) => ({ ...current, title, slug: isNew && (!current.slug || current.slug === slugify(current.title)) ? slugify(title) : current.slug }));
                }}
              />
            </Field>
            <div className="adm-group">
              <label className="adm-label" htmlFor="post-slug">
                Slug (URL) *
              </label>
              <div className="adm-inline">
                <span className="adm-prefix">/</span>
                <input id="post-slug" className="adm-input a-mono" value={form.slug} onChange={(event) => set('slug', event.target.value)} />
                <button type="button" className="adm-link" style={{ whiteSpace: 'nowrap' }} onClick={() => set('slug', slugify(form.title))}>
                  ↻ Regenerate
                </button>
              </div>
              {!isNew && form.isPublished && <span className="adm-hint">Changing the slug changes the address of this post — old links will stop working.</span>}
            </div>
            <Field label="Publish date" hint="Posts are sorted by this date; leave empty to use the time of saving">
              <input className="adm-input" type="datetime-local" value={form.publishedAt} onChange={(event) => set('publishedAt', event.target.value)} />
            </Field>
            <div className="adm-group adm-full">
              <span className="adm-label">Featured image</span>
              <ImageUpload value={form.image} onChange={(path) => set('image', path)} type="posts" aspect="16 / 9" />
            </div>
            <Field label="Excerpt" full hint={`${form.excerpt.length}/300 characters — leave empty to use the beginning of the content`}>
              <textarea className="adm-input" rows={3} maxLength={1000} value={form.excerpt} onChange={(event) => set('excerpt', event.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="adm-card">
          <RichEditor value={form.content} onChange={(html) => set('content', html)} uploadType="posts" minHeight={420} />
          <p className="adm-hint" style={{ marginTop: 8, textAlign: 'right' }}>
            {plainLength(form.content)} {plainLength(form.content) === 1 ? 'character' : 'characters'}
          </p>
        </div>
      )}

      {tab === 'preview' && (
        <div className="adm-card">
          {form.image && <img className="adm-preview__image" src={mediaSrc(form.image)} alt="" />}
          <p className="adm-preview__eyebrow">News{form.publishedAt && ` · ${dateVN(form.publishedAt.replace('T', ' '))}`}</p>
          <h2 className="adm-preview__title">{form.title || '(Untitled)'}</h2>
          {form.excerpt && <p className="adm-preview__excerpt">{form.excerpt}</p>}
          {/* Preview of the editor's own content inside the signed-in admin; the server sanitises it on save. */}
          <div className="adm-prose" dangerouslySetInnerHTML={{ __html: form.content }} />
        </div>
      )}
    </>
  );
}
