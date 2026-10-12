'use client';

import { useRef, useState, type DragEvent } from 'react';
import { api, errorText, type Uploaded } from './api';
import { mediaSrc } from './ui';

const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif';

function useDrop(onFiles: (files: File[]) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    handlers: {
      onDragOver: (event: DragEvent) => {
        event.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        setOver(false);
        onFiles(Array.from(event.dataTransfer.files));
      },
    },
  };
}

type ImageUploadProps = {
  /** Stored path ("uploads/...") or '' when empty. */
  value: string;
  onChange: (path: string) => void;
  type?: string;
  aspect?: string;
  /** Show the whole picture instead of cropping it to the frame. */
  contain?: boolean;
  /** Dark frame, for white line-art icons. */
  dark?: boolean;
};

/** Single picture: dashed dropzone when empty, preview with "Change image / Delete" when filled. */
export function ImageUpload({ value, onChange, type = 'images', aspect = '16 / 9', contain = false, dark = false }: ImageUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange((await api.upload(type, file)).path);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  const drop = useDrop((files) => upload(files[0]));

  return (
    <div className="adm-image">
      <input ref={input} type="file" accept={IMAGE_ACCEPT} hidden onChange={(event) => upload(event.target.files?.[0])} />
      {value ? (
        <>
          <div className={`adm-image__preview${contain ? ' adm-image__preview--contain' : ''}${dark ? ' adm-image__preview--dark' : ''}`} style={{ aspectRatio: aspect }}>
            <img src={mediaSrc(value)} alt="" />
          </div>
          <div className="adm-image__bar">
            <button type="button" className="adm-link" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Uploading...' : '📁 Change image'}
            </button>
            <button type="button" className="adm-link adm-link--muted" onClick={() => onChange('')}>
              🗑 Delete
            </button>
          </div>
        </>
      ) : (
        <div
          className={`adm-drop${drop.over ? ' is-over' : ''}`}
          style={{ aspectRatio: aspect, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          role="button"
          tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && input.current?.click()}
          {...drop.handlers}
        >
          <span aria-hidden="true">🖼</span>
          <strong>{busy ? 'Uploading...' : 'Click or drag an image here'}</strong>
          <small>PNG, JPG, WebP · max 20MB</small>
        </div>
      )}
      {error && <p className="adm-error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

/** Product gallery: the first picture is the main one; reorder with ← →. Nothing is saved until the tab's save button. */
export function MultiImageUpload({ value, onChange, type = 'products' }: { value: string[]; onChange: (paths: string[]) => void; type?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');

  const upload = async (files: File[]) => {
    if (files.length === 0) return;
    setError('');
    setBusy(files.length);
    const added: string[] = [];
    for (const file of files) {
      try {
        added.push((await api.upload(type, file)).path);
      } catch (failure) {
        setError(`${file.name}: ${errorText(failure)}`);
      }
      setBusy((left) => left - 1);
    }
    setBusy(0);
    if (added.length) onChange([...value, ...added]);
    if (input.current) input.current.value = '';
  };
  const drop = useDrop(upload);

  const move = (index: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  return (
    <div>
      <input ref={input} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(event) => upload(Array.from(event.target.files ?? []))} />
      <div
        className={`adm-drop${drop.over ? ' is-over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && input.current?.click()}
        {...drop.handlers}
      >
        <span aria-hidden="true">📁</span>
        <strong>{busy > 0 ? `Uploading... (${busy} left)` : 'Click or drag multiple images here'}</strong>
        <small>PNG, JPG, WebP · max 20MB per image · white backgrounds are trimmed automatically</small>
      </div>
      {error && <p className="adm-error" style={{ marginTop: 12 }}>{error}</p>}

      {value.length > 0 && (
        <div className="adm-gallery">
          {value.map((path, index) => (
            <div key={path} className={`adm-gallery__item${index === 0 ? ' is-primary' : ''}`}>
              <img src={mediaSrc(path)} alt="" loading="lazy" />
              {index === 0 && <span className="adm-gallery__chip">⭐ MAIN IMAGE</span>}
              <div className="adm-gallery__tools">
                {index > 0 && (
                  <button type="button" onClick={() => onChange([path, ...value.filter((item) => item !== path)])}>
                    ⭐ Set as main
                  </button>
                )}
                <div>
                  <button type="button" aria-label="Move left" disabled={index === 0} onClick={() => move(index, index - 1)}>
                    ←
                  </button>
                  <button type="button" aria-label="Move right" disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>
                    →
                  </button>
                </div>
                <button type="button" onClick={() => onChange(value.filter((item) => item !== path))}>
                  🗑 Delete
                </button>
              </div>
              <div className="adm-gallery__foot">#{index + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type FileUploadProps = {
  type?: string;
  accept?: string;
  label?: string;
  onUploaded: (file: Uploaded) => void;
};

/** "📎 Choose file to upload" button for documents and videos. */
export function FileUpload({ type = 'documents', accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt', label = '📎 Choose file to upload', onUploaded }: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onUploaded(await api.upload(type, file));
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <input ref={input} type="file" accept={accept} hidden onChange={(event) => upload(event.target.files?.[0])} />
      <button type="button" className="adm-btn adm-btn--dark adm-btn--sm" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Uploading...' : label}
      </button>
      {error && <p className="adm-error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
