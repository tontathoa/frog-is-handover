import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { ApiError, readBody, route, str } from '@/lib/api';
import { createSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';

// Failed attempts per address + username, to slow down password guessing.
const failures = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;

// Compared against when the username does not exist, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync('no-such-user', 10);

export const POST = route(async (request: Request) => {
  const body = await readBody(request);
  const username = str(body.username, 190).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!username || !password) throw new ApiError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu');

  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim();
  const key = `${ip}|${username}`;
  const now = Date.now();
  const recent = (failures.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_FAILURES) throw new ApiError(429, 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');

  const user = await queryOne<{ id: number; username: string; full_name: string; role: string; password_hash: string }>(
    'SELECT id, username, full_name, role, password_hash FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
    [username, username],
  );
  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) {
    recent.push(now);
    failures.set(key, recent);
    if (failures.size > 5000) failures.clear();
    throw new ApiError(401, 'Tên đăng nhập hoặc mật khẩu không đúng');
  }

  failures.delete(key);
  await execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
  const secure = new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  await createSession(user.id, secure);
  return NextResponse.json({ user: { id: user.id, username: user.username, fullName: user.full_name || user.username, role: user.role } });
});
