'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, errorText } from './api';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('auth/login', { username, password });
      router.replace('/admin/');
      router.refresh();
    } catch (failure) {
      setError(errorText(failure));
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__brand">
          <img src="/img/logo.png" alt="Frog-is" width={452} height={300} />
          <p>Sign in to the admin panel</p>
        </div>

        {error && (
          <div className="adm-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label className="adm-group">
            <span className="adm-label">Username</span>
            <input className="adm-input" name="username" autoComplete="username" autoCapitalize="none" required autoFocus value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="adm-group">
            <span className="adm-label">Password</span>
            <input className="adm-input" type="password" name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={loading}>
            {loading ? (
              <>
                <span className="adm-spinner adm-spinner--sm" /> Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
