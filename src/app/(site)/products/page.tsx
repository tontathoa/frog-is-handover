import ProductListing from '@/components/ProductListing';
import { getCollections, getProducts } from '@/lib/content';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({
  title: 'Products',
  description: 'All Frog-is products: point source speakers, array systems, ceiling speakers, subwoofers, amplifiers, mixers, microphones and accessories.',
  path: '/products/',
});

export default async function ProductsPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts()]);
  return <ProductListing current={null} collections={collections} products={products} />;
}
