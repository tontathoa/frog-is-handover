'use client';

import { useState, type FormEvent } from 'react';
import { api, errorText } from './api';
import { Field, PageHead } from './ui';

export default function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setDone(false);
    if (newPassword.length < 8) return setError('Mật khẩu mới phải có ít nhất 8 ký tự');
    if (newPassword !== confirm) return setError('Hai lần nhập mật khẩu mới không khớp');
    setSaving(true);
    try {
      await api.put('auth/password', { currentPassword, newPassword });
      setDone(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead title="Tài khoản" sub="Đổi mật khẩu đăng nhập trang quản trị" />
      <div className="adm-card" style={{ maxWidth: 520 }}>
        {error && (
          <div className="adm-error" role="alert">
            {error}
          </div>
        )}
        {done && (
          <div className="adm-info" role="status">
            ✓ Đã đổi mật khẩu.
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Mật khẩu hiện tại">
            <input className="adm-input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </Field>
          <Field label="Mật khẩu mới" hint="Ít nhất 8 ký tự">
            <input className="adm-input" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </Field>
          <Field label="Nhập lại mật khẩu mới">
            <input className="adm-input" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </Field>
          <div>
            <button type="submit" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving}>
              {saving ? 'Đang lưu...' : '💾 Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
