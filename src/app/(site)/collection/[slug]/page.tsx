import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductListing from '@/components/ProductListing';
import { getCollection, getCollections, getProducts } from '@/lib/content';
import { pageMeta } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollection((await params).slug);
  if (!collection) return {};
  return pageMeta({
    title: collection.name,
    description: `Frog-is ${collection.name}: ${collection.productCount} products.`,
    path: `/collection/${collection.slug}/`,
  });
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [collections, collection] = await Promise.all([getCollections(), getCollection(slug)]);
  if (!collection) notFound();
  const products = await getProducts(collection.slug);
  return <ProductListing current={collection} collections={collections} products={products} />;
}
