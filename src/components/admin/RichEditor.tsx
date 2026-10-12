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
  ['p', 'Paragraph'],
  ['h2', 'Heading 2'],
  ['h3', 'Heading 3'],
  ['h4', 'Heading 4'],
  ['blockquote', 'Quote'],
  ['pre', 'Code / monospace'],
];

/**
 * Dependency-free rich text editor (contentEditable + execCommand), outputs HTML.
 * The server sanitises what it receives, so nothing typed or pasted here is trusted as-is.
 */
export default function RichEditor({ value, onChange, placeholder = 'Write content...', uploadType = 'posts', minHeight = 360 }: Props) {
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
        {button('B', 'Bold', () => exec('bold'))}
        {button('I', 'Italic', () => exec('italic'))}
        {button('U', 'Underline', () => exec('underline'))}
        {button('S', 'Strikethrough', () => exec('strikeThrough'))}
        <span className="adm-editor__sep" />
        <select
          aria-label="Format"
          value=""
          onChange={(event) => {
            if (event.target.value) exec('formatBlock', event.target.value);
          }}
        >
          <option value="">Format</option>
          {FORMATS.map(([tag, label]) => (
            <option key={tag} value={tag}>
              {label}
            </option>
          ))}
        </select>
        <span className="adm-editor__sep" />
        {button('• List', 'Bulleted list', () => exec('insertUnorderedList'))}
        {button('1. List', 'Numbered list', () => exec('insertOrderedList'))}
        {button('⇤', 'Decrease indent', () => exec('outdent'))}
        {button('⇥', 'Increase indent', () => exec('indent'))}
        <span className="adm-editor__sep" />
        {button('⬅', 'Align left', () => exec('justifyLeft'))}
        {button('⬌', 'Align center', () => exec('justifyCenter'))}
        {button('➡', 'Align right', () => exec('justifyRight'))}
        <span className="adm-editor__sep" />
        {button('🔗', 'Insert link', () => {
          rememberSelection();
          setLinkOpen(true);
        })}
        {button('Unlink', 'Remove link', () => exec('unlink'))}
        {button(uploading ? '⏳ Uploading...' : '🖼 Image', 'Insert image', () => {
          rememberSelection();
          file.current?.click();
        })}
        <span className="adm-editor__sep" />
        {button('⌫ Format', 'Clear formatting', () => exec('removeFormat'))}
        {button('🗑', 'Delete all content', () => {
          if (area.current && window.confirm('Delete all content?')) {
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
            aria-label="Link URL"
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
            Insert
          </button>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setLinkOpen(false)}>
            Cancel
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
