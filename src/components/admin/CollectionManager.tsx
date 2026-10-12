'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from './api';
import { Empty, Field, Loading, Modal, PageHead, mediaSrc } from './ui';
import { ImageUpload } from './uploads';

type Collection = {
  id: number;
  slug: string;
  name: string;
  short: string;
  icon: string | null;
  iconHover: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};
type Form = { id: number | null; name: string; slug: string; short: string; icon: string; iconHover: string; sortOrder: number; isActive: boolean };

const blank = (order: number): Form => ({ id: null, name: '', slug: '', short: '', icon: '', iconHover: '', sortOrder: order, isActive: true });

export default function CollectionManager() {
  const [rows, setRows] = useState<Collection[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ data: Collection[] }>('collections')
      .then((response) => setRows(response.data))
      .catch((failure) => setError(errorText(failure)));
  }, []);
  useEffect(load, [load]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setFormError('');
    try {
      const { id, ...body } = form;
      if (id === null) await api.post('collections', body);
      else await api.put(`collections/${id}`, body);
      setForm(null);
      load();
    } catch (failure) {
      setFormError(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: Collection) => {
    try {
      await api.put(`collections/${row.id}`, { isActive: !row.isActive });
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const remove = async (row: Collection) => {
    if (!window.confirm(`Delete collection "${row.name}"?`)) return;
    try {
      await api.del(`collections/${row.id}`);
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  return (
    <>
      <PageHead title="Product collections" sub="Product groups shown in the menu, on the home page and on the Products page">
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setForm(blank((rows?.length ?? 0) + 1))}>
          + Add collection
        </button>
      </PageHead>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-card adm-card--flush">
        {!rows && !error && <Loading />}
        {rows && rows.length === 0 && <Empty icon="🗂" text="No collections yet." />}
        {rows && rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Collection name</th>
                  <th>Short name</th>
                  <th>Products</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.icon ? <img className="adm-thumb adm-thumb--dark" src={mediaSrc(row.icon)} alt="" /> : <div className="adm-thumb adm-thumb--empty" />}</td>
                    <td className="adm-cell-title">
                      <strong>{row.name}</strong>
                      <small>
                        <code>/collection/{row.slug}/</code>
                      </small>
                    </td>
                    <td className="adm-muted">{row.short}</td>
                    <td>{row.productCount}</td>
                    <td>{row.sortOrder}</td>
                    <td>
                      <button type="button" className={`adm-badge ${row.isActive ? 'adm-badge--green' : 'adm-badge--gray'}`} title="Click to change status" onClick={() => toggle(row)}>
                        {row.isActive ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div className="adm-acts">
                        <button
                          type="button"
                          className="adm-act adm-act--edit"
                          onClick={() => {
                            setFormError('');
                            setForm({ id: row.id, name: row.name, slug: row.slug, short: row.short, icon: row.icon ?? '', iconHover: row.iconHover ?? '', sortOrder: row.sortOrder, isActive: row.isActive });
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="adm-act adm-act--del" onClick={() => remove(row)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <Modal title={form.id === null ? 'Add collection' : 'Edit collection'} onClose={() => setForm(null)} onSave={save} saving={saving}>
          {formError && <div className="adm-error">{formError}</div>}
          <div className="adm-grid">
            <Field label="Collection name *" full>
              <input className="adm-input" value={form.name} autoFocus onChange={(event) => set('name', event.target.value)} />
            </Field>
            <Field label="Slug (URL)" hint="Leave empty to generate it from the name">
              <input className="adm-input a-mono" value={form.slug} onChange={(event) => set('slug', event.target.value)} />
            </Field>
            <Field label="Short name" hint="Used on product cards and the collection strip">
              <input className="adm-input" value={form.short} onChange={(event) => set('short', event.target.value)} />
            </Field>
            <Field label="Order">
              <input className="adm-input" type="number" value={form.sortOrder} onChange={(event) => set('sortOrder', Number(event.target.value) || 0)} />
            </Field>
            <div className="adm-group">
              <span className="adm-label">Status</span>
              <label className="adm-check" style={{ paddingTop: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={(event) => set('isActive', event.target.checked)} />
                Visible on website
              </label>
            </div>
            <div className="adm-group">
              <span className="adm-label">Icon (white strokes, transparent background)</span>
              <ImageUpload value={form.icon} onChange={(path) => set('icon', path)} aspect="19 / 18" contain dark />
            </div>
            <div className="adm-group">
              <span className="adm-label">Hover icon (blue strokes)</span>
              <ImageUpload value={form.iconHover} onChange={(path) => set('iconHover', path)} aspect="19 / 18" contain dark />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
