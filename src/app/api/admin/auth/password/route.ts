import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { badRequest, guard, readBody, route } from '@/lib/api';
import { execute, queryOne } from '@/lib/db';

export const PUT = route(async (request: Request) => {
  const user = await guard(request);
  const body = await readBody(request);
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const next = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (next.length < 8) throw badRequest('Mật khẩu mới phải có ít nhất 8 ký tự');
  if (next.length > 200) throw badRequest('Mật khẩu mới quá dài');
  if (next === current) throw badRequest('Mật khẩu mới phải khác mật khẩu hiện tại');

  const row = await queryOne<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', [user.id]);
  if (!row || !(await bcrypt.compare(current, row.password_hash))) throw badRequest('Mật khẩu hiện tại không đúng');

  await execute('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(next, 10), user.id]);
  return NextResponse.json({ success: true });
});
