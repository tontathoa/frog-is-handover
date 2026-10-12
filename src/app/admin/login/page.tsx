import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Đăng nhập' };

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin/');
  return <LoginForm />;
}
