'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/** Small building blocks shared by the admin screens. */

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="adm-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="adm-head__sub">{sub}</p>}
      </div>
      {children && <div className="adm-head__actions">{children}</div>}
    </div>
  );
}

/** Green "✓ Đã lưu" pill that disappears by itself. */
export function useFlash(duration = 2200): [string, (message: string) => void] {
  const [message, setMessage] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const flash = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current);
      setMessage(text);
      timer.current = window.setTimeout(() => setMessage(''), duration);
    },
    [duration],
  );
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [message, flash];
}

export function Saved({ message }: { message: string }) {
  return message ? (
    <span className="adm-saved" role="status">
      ✓ {message}
    </span>
  ) : null;
}

export type TabDef = { id: string; label: string; disabled?: boolean; title?: string };

export function Tabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="adm-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          className={`adm-tab${tab.id === active ? ' is-active' : ''}`}
          disabled={tab.disabled}
          title={tab.title}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Search box that reports its value 400 ms after the last keystroke. */
export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const [text, setText] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  const update = (next: string, immediate = false) => {
    setText(next);
    window.clearTimeout(timer.current);
    if (immediate) onChange(next);
    else timer.current = window.setTimeout(() => onChange(next), 400);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="adm-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input className="adm-input adm-input--sm" type="search" aria-label={placeholder} placeholder={placeholder} value={text} onChange={(event) => update(event.target.value)} />
      {text && (
        <button type="button" className="adm-search__clear" aria-label="Xóa tìm kiếm" onClick={() => update('', true)}>
          ✕
        </button>
      )}
    </div>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
  wide?: boolean;
  children: ReactNode;
};

export function Modal({ title, onClose, onSave, saving = false, wide = false, children }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="adm-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`adm-modal${wide ? ' adm-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal__head">
          <h2>{title}</h2>
          <button type="button" className="adm-modal__close" aria-label="Đóng" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
        <div className="adm-modal__foot">
          <button type="button" className="adm-btn adm-btn--outline adm-btn--sm" onClick={onClose}>
            {onSave ? 'Hủy' : 'Đóng'}
          </button>
          {onSave && (
            <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving} onClick={onSave}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Numbered pages with ‹ › and "…" gaps (window of ±2 around the current page). */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  const numbers: (number | 'gap')[] = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 2) numbers.push(n);
    else if (numbers[numbers.length - 1] !== 'gap') numbers.push('gap');
  }
  return (
    <nav className="adm-pagination" aria-label="Phân trang">
      <button type="button" className="adm-page-btn" disabled={page <= 1} aria-label="Trang trước" onClick={() => onChange(page - 1)}>
        ‹
      </button>
      {numbers.map((n, i) =>
        n === 'gap' ? (
          <span key={`gap-${i}`} className="adm-page-gap">
            …
          </span>
        ) : (
          <button key={n} type="button" className={`adm-page-btn${n === page ? ' is-active' : ''}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>
            {n}
          </button>
        ),
      )}
      <button type="button" className="adm-page-btn" disabled={page >= pages} aria-label="Trang sau" onClick={() => onChange(page + 1)}>
        ›
      </button>
    </nav>
  );
}

export function Loading() {
  return (
    <div className="adm-loading" role="status" aria-label="Đang tải">
      <div className="adm-spinner" />
    </div>
  );
}

export function Empty({ icon, text, children }: { icon: string; text: string; children?: ReactNode }) {
  return (
    <div className="adm-empty">
      <span aria-hidden="true">{icon}</span>
      <p>{text}</p>
      {children}
    </div>
  );
}

export function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: ReactNode }) {
  return (
    <label className={`adm-group${full ? ' adm-full' : ''}`}>
      <span className="adm-label">{label}</span>
      {children}
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

/** "2026-10-11 09:30:00" -> "11/10/2026". */
export function dateVN(value: string | null | undefined, withTime = false): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/.exec(value ?? '');
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}${withTime && match[4] ? ` ${match[4]}` : ''}`;
}

export const mediaSrc = (path: string | null | undefined): string => (path ? (/^https?:\/\//.test(path) ? path : `/${path.replace(/^\/+/, '')}`) : '');
