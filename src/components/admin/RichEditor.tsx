'use client';

import { useEffect, useRef, useState } from 'react';
import { api, errorText } from './api';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Upload bucket for pictures inserted into the text. */
  uploadType?: string;
  minHeight?: number;
};

const FORMATS: [string, string][] = [
  ['p', 'Đoạn văn'],
  ['h2', 'Tiêu đề 2'],
  ['h3', 'Tiêu đề 3'],
  ['h4', 'Tiêu đề 4'],
  ['blockquote', 'Trích dẫn'],
  ['pre', 'Mã / chữ đều'],
];

/**
 * Dependency-free rich text editor (contentEditable + execCommand), outputs HTML.
 * The server sanitises what it receives, so nothing typed or pasted here is trusted as-is.
 */
export default function RichEditor({ value, onChange, placeholder = 'Soạn nội dung...', uploadType = 'posts', minHeight = 360 }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Push outside changes (initial load, switching records) into the editable area
  // without touching it while the user types.
  useEffect(() => {
    const el = area.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // older engines: lines become <div>, which the server also accepts
    }
  }, []);

  const emit = () => {
    if (area.current) onChange(area.current.innerHTML);
  };
  const exec = (command: string, argument?: string) => {
    area.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };
  const rememberSelection = () => {
    const selection = window.getSelection();
    savedRange.current = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
  };
  const restoreSelection = () => {
    area.current?.focus();
    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    setLinkOpen(false);
    setLinkUrl('');
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url)) return;
    restoreSelection();
    document.execCommand('createLink', false, url);
    emit();
  };

  const insertImage = async (picked: File | undefined) => {
    if (!picked) return;
    setUploading(true);
    try {
      const uploaded = await api.upload(uploadType, picked);
      restoreSelection();
      document.execCommand('insertImage', false, uploaded.url);
      emit();
    } catch (failure) {
      window.alert(errorText(failure));
    } finally {
      setUploading(false);
      if (file.current) file.current.value = '';
    }
  };

  const button = (label: string, title: string, action: () => void) => (
    <button type="button" title={title} aria-label={title} onMouseDown={(event) => event.preventDefault()} onClick={action}>
      {label}
    </button>
  );

  return (
    <div className="adm-editor">
      <div className="adm-editor__bar">
        {button('B', 'Đậm', () => exec('bold'))}
        {button('I', 'Nghiêng', () => exec('italic'))}
        {button('U', 'Gạch chân', () => exec('underline'))}
        {button('S', 'Gạch ngang', () => exec('strikeThrough'))}
        <span className="adm-editor__sep" />
        <select
          aria-label="Định dạng"
          value=""
          onChange={(event) => {
            if (event.target.value) exec('formatBlock', event.target.value);
          }}
        >
          <option value="">Định dạng</option>
          {FORMATS.map(([tag, label]) => (
            <option key={tag} value={tag}>
              {label}
            </option>
          ))}
        </select>
        <span className="adm-editor__sep" />
        {button('• List', 'Danh sách chấm', () => exec('insertUnorderedList'))}
        {button('1. List', 'Danh sách số', () => exec('insertOrderedList'))}
        {button('⇤', 'Giảm thụt lề', () => exec('outdent'))}
        {button('⇥', 'Tăng thụt lề', () => exec('indent'))}
        <span className="adm-editor__sep" />
        {button('⬅', 'Căn trái', () => exec('justifyLeft'))}
        {button('⬌', 'Căn giữa', () => exec('justifyCenter'))}
        {button('➡', 'Căn phải', () => exec('justifyRight'))}
        <span className="adm-editor__sep" />
        {button('🔗', 'Chèn liên kết', () => {
          rememberSelection();
          setLinkOpen(true);
        })}
        {button('Bỏ link', 'Bỏ liên kết', () => exec('unlink'))}
        {button(uploading ? '⏳ Đang tải...' : '🖼 Ảnh', 'Chèn ảnh', () => {
          rememberSelection();
          file.current?.click();
        })}
        <span className="adm-editor__sep" />
        {button('⌫ Format', 'Xóa định dạng', () => exec('removeFormat'))}
        {button('🗑', 'Xóa toàn bộ nội dung', () => {
          if (area.current && window.confirm('Xóa toàn bộ nội dung?')) {
            area.current.innerHTML = '';
            emit();
          }
        })}
        <input ref={file} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" hidden onChange={(event) => insertImage(event.target.files?.[0])} />
      </div>

      {linkOpen && (
        <div className="adm-editor__link">
          <input
            className="adm-input adm-input--sm"
            aria-label="Địa chỉ liên kết"
            placeholder="https://..."
            value={linkUrl}
            autoFocus
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                insertLink();
              }
            }}
          />
          <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={insertLink}>
            Chèn
          </button>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setLinkOpen(false)}>
            Hủy
          </button>
        </div>
      )}

      <div
        ref={area}
        className="adm-editor__area adm-prose"
        style={{ minHeight }}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={(event) => {
          // Paste as plain text: keeps Word / web page markup out of the content.
          event.preventDefault();
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        }}
      />
    </div>
  );
}
