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
    if (newPassword.length < 8) return setError('The new password must be at least 8 characters');
    if (newPassword !== confirm) return setError('The new passwords do not match');
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
      <PageHead title="Account" sub="Change the password used to sign in to the admin panel" />
      <div className="adm-card" style={{ maxWidth: 520 }}>
        {error && (
          <div className="adm-error" role="alert">
            {error}
          </div>
        )}
        {done && (
          <div className="adm-info" role="status">
            ✓ Password changed.
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Current password">
            <input className="adm-input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </Field>
          <Field label="New password" hint="At least 8 characters">
            <input className="adm-input" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <input className="adm-input" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </Field>
          <div>
            <button type="submit" className="adm-btn adm-btn--primary adm-btn--sm" disabled={saving}>
              {saving ? 'Saving...' : '💾 Change password'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
