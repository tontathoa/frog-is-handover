import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { badRequest, guard, readBody, route } from '@/lib/api';
import { execute, queryOne } from '@/lib/db';

export const PUT = route(async (request: Request) => {
  const user = await guard(request);
  const body = await readBody(request);
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const next = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (next.length < 8) throw badRequest('The new password must be at least 8 characters');
  if (next.length > 200) throw badRequest('The new password is too long');
  if (next === current) throw badRequest('The new password must be different from the current password');

  const row = await queryOne<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', [user.id]);
  if (!row || !(await bcrypt.compare(current, row.password_hash))) throw badRequest('Current password is incorrect');

  await execute('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(next, 10), user.id]);
  return NextResponse.json({ success: true });
});
