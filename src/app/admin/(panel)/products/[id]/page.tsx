import { notFound } from 'next/navigation';
import ProductEditor from '@/components/admin/ProductEditor';

export const metadata = { title: 'Products' };

/** /admin/products/new/ creates a record, /admin/products/<id>/ edits one. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== 'new' && !/^[1-9]\d*$/.test(id)) notFound();
  return <ProductEditor key={id} id={id === 'new' ? null : Number(id)} />;
}
