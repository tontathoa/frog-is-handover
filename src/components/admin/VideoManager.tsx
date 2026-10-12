'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from './api';
import { Empty, Field, Loading, Modal, PageHead, mediaSrc } from './ui';
import { FileUpload, ImageUpload } from './uploads';

type Video = {
  id: number;
  slug: string;
  title: string;
  thumb: string | null;
  video: string | null;
  embed: string | null;
  duration: string;
  sortOrder: number;
  isActive: boolean;
};
type Form = { id: number | null; title: string; slug: string; thumb: string; video: string; embed: string; duration: string; sortOrder: number; isActive: boolean };

export default function VideoManager() {
  const [rows, setRows] = useState<Video[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ data: Video[] }>('videos')
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
      if (id === null) await api.post('videos', body);
      else await api.put(`videos/${id}`, body);
      setForm(null);
      load();
    } catch (failure) {
      setFormError(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: Video) => {
    try {
      await api.put(`videos/${row.id}`, { isActive: !row.isActive });
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const remove = async (row: Video) => {
    if (!window.confirm(`Delete video "${row.title}"?`)) return;
    try {
      await api.del(`videos/${row.id}`);
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  return (
    <>
      <PageHead title="Application videos" sub="Videos shown on the Applications page and the home page">
        <button
          type="button"
          className="adm-btn adm-btn--primary adm-btn--sm"
          onClick={() => {
            setFormError('');
            setForm({ id: null, title: '', slug: '', thumb: '', video: '', embed: '', duration: '', sortOrder: (rows?.length ?? 0) + 1, isActive: true });
          }}
        >
          + Add video
        </button>
      </PageHead>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-card adm-card--flush">
        {!rows && !error && <Loading />}
        {rows && rows.length === 0 && <Empty icon="🎬" text="No videos yet." />}
        {rows && rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Source</th>
                  <th>Duration</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.thumb ? <img className="adm-thumb adm-thumb--wide" src={mediaSrc(row.thumb)} alt="" loading="lazy" /> : <div className="adm-thumb adm-thumb--wide adm-thumb--empty">🎬</div>}</td>
                    <td className="adm-cell-title">
                      <strong>{row.title}</strong>
                      <small>
                        <code>/video/{row.slug}/</code>
                      </small>
                    </td>
                    <td className="adm-muted">{row.video ? 'MP4 file' : row.embed ? 'Embed link' : '—'}</td>
                    <td className="adm-muted">{row.duration || '—'}</td>
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
                            setForm({ id: row.id, title: row.title, slug: row.slug, thumb: row.thumb ?? '', video: row.video ?? '', embed: row.embed ?? '', duration: row.duration, sortOrder: row.sortOrder, isActive: row.isActive });
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
        <Modal title={form.id === null ? 'Add video' : 'Edit video'} onClose={() => setForm(null)} onSave={save} saving={saving} wide>
          {formError && <div className="adm-error">{formError}</div>}
          <div className="adm-grid">
            <Field label="Title *" full>
              <input className="adm-input" value={form.title} autoFocus onChange={(event) => set('title', event.target.value)} />
            </Field>
            <Field label="Slug (URL)" hint="Leave empty to generate from the title">
              <input className="adm-input a-mono" value={form.slug} onChange={(event) => set('slug', event.target.value)} />
            </Field>
            <Field label="Duration" hint="Example: 01:00">
              <input className="adm-input" value={form.duration} onChange={(event) => set('duration', event.target.value)} />
            </Field>
            <div className="adm-group">
              <span className="adm-label">Featured image</span>
              <ImageUpload value={form.thumb} onChange={(path) => set('thumb', path)} aspect="16 / 9" />
            </div>
            <div className="adm-group">
              <span className="adm-label">Video file (MP4, max 200MB)</span>
              {form.video ? (
                <div className="adm-file-row">
                  <span aria-hidden="true">🎬</span>
                  <a href={`/${form.video}`} target="_blank" rel="noopener">
                    {form.video.split('/').pop()}
                  </a>
                  <button type="button" className="adm-row__remove" aria-label="Remove video file" onClick={() => set('video', '')}>
                    ✕
                  </button>
                </div>
              ) : (
                <FileUpload type="videos" accept=".mp4,.webm" label="🎬 Choose video file" onUploaded={(file) => set('video', file.path)} />
              )}
              <span className="adm-label" style={{ marginTop: 12 }}>
                Or embed link
              </span>
              <input className="adm-input" placeholder="https://www.youtube.com/embed/..." value={form.embed} onChange={(event) => set('embed', event.target.value)} />
              <span className="adm-hint">When an MP4 file is set, the website plays the file; the embed link is only used when there is no file.</span>
            </div>
            <Field label="Order">
              <input className="adm-input" type="number" value={form.sortOrder} onChange={(event) => set('sortOrder', Number(event.target.value) || 0)} />
            </Field>
            <div className="adm-group">
              <span className="adm-label">Status</span>
              <label className="adm-check" style={{ paddingTop: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={(event) => set('isActive', event.target.checked)} />
                Visible on the website
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
