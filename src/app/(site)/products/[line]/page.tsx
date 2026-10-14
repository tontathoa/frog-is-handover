import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductListing from '@/components/ProductListing';
import { getCollections, getProducts } from '@/lib/content';
import { isProductLine, PRODUCT_LINES } from '@/lib/lines';
import { pageMeta } from '@/lib/meta';

type Props = { params: Promise<{ line: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_LINES.map((item) => ({ line: item.value }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { line } = await params;
  const info = PRODUCT_LINES.find((item) => item.value === line);
  if (!info) return {};
  return pageMeta({
    title: `${info.label} products`,
    description: `Frog-is ${info.label}: ${info.text}`,
    path: `/products/${info.value}/`,
    image: info.photo,
  });
}

/** /products/installation/ and /products/performance/: the product list with that line already switched on. */
export default async function ProductLinePage({ params }: Props) {
  const { line } = await params;
  if (!isProductLine(line)) notFound();
  const [collections, products] = await Promise.all([getCollections(), getProducts()]);
  return <ProductListing current={null} collections={collections} products={products} line={line} />;
}
