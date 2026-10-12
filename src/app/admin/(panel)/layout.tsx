import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { getSessionUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';

// Every screen below needs a signed-in admin; the API routes check the session again on each call.
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login/');
  const row = await queryOne<{ unread: number }>('SELECT COUNT(*) AS unread FROM messages WHERE is_read = 0');

  return (
    <AdminShell user={{ fullName: user.fullName, role: user.role }} unread={Number(row?.unread ?? 0)}>
      {children}
    </AdminShell>
  );
}
