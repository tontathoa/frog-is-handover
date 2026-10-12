import { notFound } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export const metadata = { title: 'Posts' };

/** /admin/posts/new/ creates a record, /admin/posts/<id>/ edits one. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== 'new' && !/^[1-9]\d*$/.test(id)) notFound();
  return <PostEditor key={id} id={id === 'new' ? null : Number(id)} />;
}
