'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RichEditor from './RichEditor';
import { api, errorText } from './api';
import { Field, Loading, Saved, Tabs, useFlash, type TabDef } from './ui';
import { FileUpload, MultiImageUpload } from './uploads';
import { PRODUCT_LINES } from '@/lib/lines';
import type { ProductLine } from '@/lib/types';

type SpecGroup = { title: string; rows: string[][] };
type ProductFile = { label: string; file: string };
type Form = {
  title: string;
  slug: string;
  subtitle: string;
  collectionId: number | null;
  sortOrder: number;
  isActive: boolean;
  isNew: boolean;
  line: ProductLine | null;
  description: string;
  images: string[];
  features: string[];
  applications: string[];
  specs: SpecGroup[];
  files: ProductFile[];
};
type CollectionOption = { id: number; name: string };

const EMPTY: Form = {
  title: '',
  slug: '',
  subtitle: '',
  collectionId: null,
  sortOrder: 0,
  isActive: true,
  isNew: false,
  line: null,
  description: '',
  images: [],
  features: [],
  applications: [],
  specs: [],
  files: [],
};

const FILE_LABELS = ['Data sheet', 'Manual', 'Brochure', 'Software', 'Certificate', 'Drawing'];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Stored rich text uses site-relative media paths; the editor needs URLs it can show. */
const forEditing = (html: string) => html.replaceAll('{{site}}', '/').replace(/(src|href)="uploads\//g, '$1="/uploads/');

export default function ProductEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(id !== null);
  const [loadError, setLoadError] = useState('');
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [saved, flash] = useFlash();
  const isNew = id === null;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    api
      .get<{ data: CollectionOption[] }>('collections')
      .then((response) => setCollections(response.data))
      .catch(() => undefined);
    if (id === null) return;
    api
      .get<Form>(`products/${id}`)
      .then((product) => setForm({ ...EMPTY, ...product, description: forEditing(product.description ?? '') }))
      .catch((failure) => setLoadError(errorText(failure)))
      .finally(() => setLoading(false));
  }, [id]);

  /** Each tab saves only its own fields. */
  const save = async (fields: (keyof Form)[], message = 'Saved') => {
    setSaving(true);
    try {
      const body = Object.fromEntries(fields.map((field) => [field, form[field]]));
      if (isNew) {
        if (!form.title.trim()) throw new Error('Please enter a product name');
        const created = await api.post<{ id: number }>('products', { ...form });
        router.replace(`/admin/products/${created.id}/`);
        return;
      }
      await api.put(`products/${id}`, body);
      flash(message);
    } catch (failure) {
      window.alert(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  const saveBar = (fields: (keyof Form)[], label = '💾 Save changes') => (
    <div className="adm-savebar">
      <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving} onClick={() => save(fields)}>
        {saving ? 'Saving...' : label}
      </button>
    </div>
  );

  if (loading) return <Loading />;
  if (loadError) return <div className="adm-error">{loadError}</div>;

  const locked = isNew ? { disabled: true, title: 'Save the basic info first' } : {};
  const tabs: TabDef[] = [
    { id: 'basic', label: '📝 Basic info' },
    { id: 'images', label: `🖼 Images${form.images.length ? ` (${form.images.length})` : ''}`, ...locked },
    { id: 'description', label: '📄 Description', ...locked },
    { id: 'features', label: '✅ Features', ...locked },
    { id: 'applications', label: '🎯 Applications', ...locked },
    { id: 'specs', label: '📊 Specifications', ...locked },
    { id: 'files', label: `📁 Documents${form.files.length ? ` (${form.files.length})` : ''}`, ...locked },
  ];

  const lineList = (key: 'features' | 'applications', addLabel: string, placeholder: string) => (
    <div className="adm-card">
      <div className="adm-rows">
        {form[key].map((line, index) => (
          <div key={index} className="adm-row">
            <span className="adm-row__index">{index + 1}</span>
            <input
              className="adm-input adm-input--sm"
              aria-label={`${placeholder} ${index + 1}`}
              placeholder={placeholder}
              value={line}
              onChange={(event) => set(key, form[key].map((item, i) => (i === index ? event.target.value : item)))}
            />
            <button type="button" className="adm-row__remove" aria-label="Delete row" onClick={() => set(key, form[key].filter((_, i) => i !== index))}>
              ✕
            </button>
          </div>
        ))}
        {form[key].length === 0 && <p className="adm-muted">No rows yet.</p>}
      </div>
      <button type="button" className="adm-link" style={{ marginTop: 12 }} onClick={() => set(key, [...form[key], ''])}>
        + {addLabel}
      </button>
      {saveBar([key])}
    </div>
  );

  const updateGroup = (index: number, group: SpecGroup) => set('specs', form.specs.map((item, i) => (i === index ? group : item)));

  return (
    <>
      <div className="adm-head adm-head--editor">
        <button type="button" className="adm-back" aria-label="Back to list" onClick={() => router.push('/admin/products/')}>
          ←
        </button>
        <h1>{isNew ? 'Add new product' : form.title || 'Product'}</h1>
        <Saved message={saved} />
        {!isNew && form.isActive && (
          <a className="adm-btn adm-btn--outline adm-btn--sm" href={`/product/${encodeURIComponent(form.slug)}/`} target="_blank" rel="noopener">
            👁 View page
          </a>
        )}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'basic' && (
        <div className="adm-card">
          <div className="adm-grid">
            <Field label="Product name (code) *" hint="Example: FI-SUB12IP">
              <input
                className="adm-input"
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((current) => ({ ...current, title, slug: isNew && (!current.slug || current.slug === slugify(current.title)) ? slugify(title) : current.slug }));
                }}
              />
            </Field>
            <Field label="Collection">
              <select className="adm-input" value={form.collectionId ?? ''} onChange={(event) => set('collectionId', event.target.value ? Number(event.target.value) : null)}>
                <option value="">-- None selected --</option>
                {collections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Product line" hint="Installation or Performance. Leave on Shared for products that belong to both lines (microphones, accessories...).">
              <select className="adm-input" value={form.line ?? ''} onChange={(event) => set('line', (event.target.value || null) as ProductLine | null)}>
                <option value="">Shared (both lines)</option>
                {PRODUCT_LINES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="adm-group">
              <label className="adm-label" htmlFor="product-slug">
                Slug (URL)
              </label>
              <div className="adm-inline">
                <span className="adm-prefix">/product/</span>
                <input id="product-slug" className="adm-input a-mono" value={form.slug} onChange={(event) => set('slug', event.target.value)} />
                <button type="button" className="adm-link" style={{ whiteSpace: 'nowrap' }} onClick={() => set('slug', slugify(form.title))}>
                  ↻ Generate
                </button>
              </div>
              {!isNew && <span className="adm-hint">Changing the slug changes the product page address — old links will stop working.</span>}
            </div>
            <Field label="Order" hint="Lower numbers appear first in the collection">
              <input className="adm-input" type="number" value={form.sortOrder} onChange={(event) => set('sortOrder', Number(event.target.value) || 0)} />
            </Field>
            <Field label="Short description" full hint="One line under the product name, e.g. Outdoor IP55 Subwoofer with 12” Driver">
              <textarea className="adm-input" rows={2} maxLength={500} value={form.subtitle} onChange={(event) => set('subtitle', event.target.value)} />
            </Field>
            <div className="adm-group adm-full">
              <span className="adm-label">Options</span>
              <div className="adm-checks">
                <label className="adm-check">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => set('isActive', event.target.checked)} />
                  Visible on website
                </label>
                <label className="adm-check">
                  <input type="checkbox" checked={form.isNew} onChange={(event) => set('isNew', event.target.checked)} />
                  New product ⭐ (shown on the home page)
                </label>
              </div>
            </div>
          </div>
          {saveBar(['title', 'slug', 'subtitle', 'collectionId', 'line', 'sortOrder', 'isActive', 'isNew'], isNew ? '💾 Create product' : '💾 Save changes')}
        </div>
      )}

      {tab === 'images' && (
        <div className="adm-card">
          <MultiImageUpload value={form.images} onChange={(images) => set('images', images)} />
          {saveBar(['images'])}
        </div>
      )}

      {tab === 'description' && (
        <div className="adm-card">
          <RichEditor value={form.description} onChange={(html) => set('description', html)} uploadType="products" minHeight={300} placeholder="Product description..." />
          {saveBar(['description'], '💾 Save description')}
        </div>
      )}

      {tab === 'features' && lineList('features', 'Add feature', 'Feature')}
      {tab === 'applications' && lineList('applications', 'Add application', 'Application')}

      {tab === 'specs' && (
        <div className="adm-card">
          {form.specs.map((group, index) => (
            <div key={index} className="adm-spec">
              <div className="adm-spec__head">
                <input
                  className="adm-input adm-input--sm"
                  aria-label="Specification group name"
                  placeholder="Group name, e.g. Specifications"
                  value={group.title}
                  onChange={(event) => updateGroup(index, { ...group, title: event.target.value })}
                />
                <button type="button" className="adm-link" style={{ whiteSpace: 'nowrap' }} onClick={() => updateGroup(index, { ...group, rows: [...group.rows, ['', '']] })}>
                  + Add row
                </button>
                <button
                  type="button"
                  className="adm-link adm-link--muted"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => window.confirm('Delete this entire specification group?') && set('specs', form.specs.filter((_, i) => i !== index))}
                >
                  Delete group
                </button>
              </div>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: '36%' }}>Specification</th>
                    <th>Value</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row, r) => {
                    const setCell = (cell: number, value: string) =>
                      updateGroup(index, { ...group, rows: group.rows.map((item, i) => (i === r ? item.map((text, c) => (c === cell ? value : text)) : item)) });
                    return (
                      <tr key={r}>
                        <td>
                          <input className="adm-input adm-input--sm" aria-label="Specification" value={row[0] ?? ''} onChange={(event) => setCell(0, event.target.value)} />
                        </td>
                        <td>
                          <textarea
                            className="adm-input adm-input--sm"
                            aria-label="Value"
                            rows={Math.max(1, (row[1] ?? '').split('\n').length)}
                            value={row[1] ?? ''}
                            onChange={(event) => setCell(1, event.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="adm-row__remove"
                            aria-label="Delete row"
                            onClick={() => updateGroup(index, { ...group, rows: group.rows.filter((_, i) => i !== r) })}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
          {form.specs.length === 0 && <p className="adm-muted" style={{ marginBottom: 12 }}>No specification groups yet.</p>}
          <button type="button" className="adm-link" onClick={() => set('specs', [...form.specs, { title: form.specs.length ? 'New group' : 'Specifications', rows: [['', '']] }])}>
            + Add group
          </button>
          {saveBar(['specs'])}
        </div>
      )}

      {tab === 'files' && (
        <div className="adm-card">
          <FileUpload onUploaded={(file) => set('files', [...form.files, { label: form.files.length ? 'Manual' : 'Data sheet', file: file.path }])} />
          <p className="adm-hint" style={{ margin: '8px 0 16px' }}>
            Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, ZIP, RAR — max 100MB.
          </p>
          <div className="adm-rows">
            {form.files.map((file, index) => (
              <div key={file.file} className="adm-file-row">
                <span aria-hidden="true">📄</span>
                <select
                  className="adm-input adm-input--sm"
                  style={{ width: 150 }}
                  aria-label="Document type"
                  value={file.label}
                  onChange={(event) => set('files', form.files.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))}
                >
                  {[...new Set([file.label, ...FILE_LABELS])].map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <a href={`/${file.file}`} target="_blank" rel="noopener">
                  {file.file.split('/').pop()}
                </a>
                <button type="button" className="adm-row__remove" aria-label="Remove document" onClick={() => set('files', form.files.filter((_, i) => i !== index))}>
                  ✕
                </button>
              </div>
            ))}
            {form.files.length === 0 && <p className="adm-muted">No documents yet.</p>}
          </div>
          {saveBar(['files'])}
        </div>
      )}
    </>
  );
}
