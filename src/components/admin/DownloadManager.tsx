'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from './api';
import { Empty, Field, Loading, Modal, PageHead, mediaSrc } from './ui';
import { FileUpload, ImageUpload } from './uploads';

type Download = { id: number; title: string; file: string | null; remote: string | null; image: string | null; sortOrder: number; isActive: boolean };
type Form = { id: number | null; title: string; file: string; remote: string; image: string; sortOrder: number; isActive: boolean };

export default function DownloadManager() {
  const [rows, setRows] = useState<Download[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ data: Download[] }>('downloads')
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
      if (id === null) await api.post('downloads', body);
      else await api.put(`downloads/${id}`, body);
      setForm(null);
      load();
    } catch (failure) {
      setFormError(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: Download) => {
    try {
      await api.put(`downloads/${row.id}`, { isActive: !row.isActive });
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const remove = async (row: Download) => {
    if (!window.confirm(`Xóa tài liệu "${row.title}"?`)) return;
    try {
      await api.del(`downloads/${row.id}`);
      load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  return (
    <>
      <PageHead title="Tài liệu tải về" sub="Catalog, chứng chỉ, phần mềm — hiện ở trang Download. Datasheet của từng sản phẩm nằm trong tab Tài liệu của sản phẩm.">
        <button
          type="button"
          className="adm-btn adm-btn--primary adm-btn--sm"
          onClick={() => {
            setFormError('');
            setForm({ id: null, title: '', file: '', remote: '', image: '', sortOrder: (rows?.length ?? 0) + 1, isActive: true });
          }}
        >
          + Thêm tài liệu
        </button>
      </PageHead>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-card adm-card--flush">
        {!rows && !error && <Loading />}
        {rows && rows.length === 0 && <Empty icon="📁" text="Chưa có tài liệu nào." />}
        {rows && rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Ảnh bìa</th>
                  <th>Tên tài liệu</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.image ? <img className="adm-thumb" src={mediaSrc(row.image)} alt="" loading="lazy" /> : <div className="adm-thumb adm-thumb--empty">📄</div>}</td>
                    <td className="adm-cell-title">
                      <strong>{row.title}</strong>
                      <small>{(row.file ?? row.remote ?? '').split('/').pop()}</small>
                    </td>
                    <td>{row.sortOrder}</td>
                    <td>
                      <button type="button" className={`adm-badge ${row.isActive ? 'adm-badge--green' : 'adm-badge--gray'}`} title="Bấm để đổi trạng thái" onClick={() => toggle(row)}>
                        {row.isActive ? 'Hiện' : 'Ẩn'}
                      </button>
                    </td>
                    <td>
                      <div className="adm-acts">
                        <button
                          type="button"
                          className="adm-act adm-act--edit"
                          onClick={() => {
                            setFormError('');
                            setForm({ id: row.id, title: row.title, file: row.file ?? '', remote: row.remote ?? '', image: row.image ?? '', sortOrder: row.sortOrder, isActive: row.isActive });
                          }}
                        >
                          Sửa
                        </button>
                        <button type="button" className="adm-act adm-act--del" onClick={() => remove(row)}>
                          Xóa
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
        <Modal title={form.id === null ? 'Thêm tài liệu' : 'Sửa tài liệu'} onClose={() => setForm(null)} onSave={save} saving={saving} wide>
          {formError && <div className="adm-error">{formError}</div>}
          <div className="adm-grid">
            <Field label="Tên tài liệu *" full>
              <input className="adm-input" value={form.title} autoFocus onChange={(event) => set('title', event.target.value)} />
            </Field>
            <div className="adm-group">
              <span className="adm-label">File</span>
              {form.file ? (
                <div className="adm-file-row">
                  <span aria-hidden="true">📄</span>
                  <a href={`/${form.file}`} target="_blank" rel="noopener">
                    {form.file.split('/').pop()}
                  </a>
                  <button type="button" className="adm-row__remove" aria-label="Gỡ file" onClick={() => set('file', '')}>
                    ✕
                  </button>
                </div>
              ) : (
                <FileUpload onUploaded={(file) => set('file', file.path)} />
              )}
              <span className="adm-hint">PDF, ZIP, RAR, DOC, XLS, PPT — tối đa 100MB.</span>
              <span className="adm-label" style={{ marginTop: 12 }}>
                Hoặc đường dẫn bên ngoài
              </span>
              <input className="adm-input" placeholder="https://..." value={form.remote} onChange={(event) => set('remote', event.target.value)} />
            </div>
            <div className="adm-group">
              <span className="adm-label">Ảnh bìa</span>
              <ImageUpload value={form.image} onChange={(path) => set('image', path)} aspect="3 / 4" contain />
            </div>
            <Field label="Thứ tự">
              <input className="adm-input" type="number" value={form.sortOrder} onChange={(event) => set('sortOrder', Number(event.target.value) || 0)} />
            </Field>
            <div className="adm-group">
              <span className="adm-label">Trạng thái</span>
              <label className="adm-check" style={{ paddingTop: 8 }}>
                <input type="checkbox" checked={form.isActive} onChange={(event) => set('isActive', event.target.checked)} />
                Hiển thị trên web
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
