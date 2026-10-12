import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { queryOne } from './db';

/** Admin sessions: a signed JWT in an httpOnly cookie (never readable from page scripts). */

export const SESSION_COOKIE = 'frogis_admin';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = { id: number; username: string; fullName: string; email: string | null; role: 'admin' | 'editor' };

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET ?? '';
  if (value.length < 32) {
    throw new Error('AUTH_SECRET is missing or shorter than 32 characters — see .env.example.');
  }
  return new TextEncoder().encode(value);
}

export async function createSession(userId: number, secure: boolean): Promise<void> {
  const token = await new SignJWT({ kind: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in admin, re-checked against the database on every request (so disabling a user takes effect at once). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let userId: number;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (payload.kind !== 'admin') return null;
    userId = Number(payload.sub);
  } catch {
    return null;
  }
  if (!Number.isInteger(userId)) return null;
  const row = await queryOne<{ id: number; username: string; full_name: string; email: string | null; role: 'admin' | 'editor' }>(
    'SELECT id, username, full_name, email, role FROM users WHERE id = ? AND is_active = 1',
    [userId],
  );
  return row ? { id: row.id, username: row.username, fullName: row.full_name || row.username, email: row.email, role: row.role } : null;
});
