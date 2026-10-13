import Link from 'next/link';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import { mediaUrl } from '@/lib/format';
import type { Collection, Product } from '@/lib/types';

type Props = {
  current: Collection | null;
  collections: Collection[];
  products: Product[];
};

/** /products/ and /collection/<slug>/: title, collection strip, filterable grid. */
export default function ProductListing({ current, collections, products }: Props) {
  const bySlug = new Map(collections.map((c) => [c.slug, c]));
  const entries = products.map((product) => {
    const collection = bySlug.get(product.collection ?? '');
    return {
      key: product.slug,
      text: `${product.title} ${product.subtitle} ${collection?.name ?? ''}`.toLowerCase(),
      line: product.line,
      node: <ProductCard product={product} label={collection?.short} heading="h2" />,
    };
  });

  return (
    <>
      <div className="page-head">
        <h1 className="display">{current?.name ?? 'Products'}</h1>
      </div>

      <nav className="cstrip" aria-label="Collections">
        <div className="cstrip__track">
          <Link className={`cstrip__item${current ? '' : ' is-active'}`} href="/products/" aria-current={current ? undefined : 'page'}>
            <span className="cstrip__icon cstrip__icon--all" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 34 34">
                <g fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="4" width="10" height="10" rx="1.5" />
                  <rect x="20" y="4" width="10" height="10" rx="1.5" />
                  <rect x="4" y="20" width="10" height="10" rx="1.5" />
                  <rect x="20" y="20" width="10" height="10" rx="1.5" />
                </g>
              </svg>
            </span>
            <span className="cstrip__name">All</span>
          </Link>
          {collections.map((c) => {
            const active = current?.slug === c.slug;
            return (
              <Link
                key={c.slug}
                className={`cstrip__item${active ? ' is-active' : ''}`}
                href={`/collection/${c.slug}/`}
                aria-current={active ? 'page' : undefined}
                title={c.name}
              >
                <span className="cstrip__icon">
                  {c.icon && <img src={mediaUrl(c.icon)} alt="" width={95} height={90} />}
                  {c.iconHover && <img className="is-hover" src={mediaUrl(c.iconHover)} alt="" loading="lazy" width={95} height={90} />}
                </span>
                <span className="cstrip__name">{c.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <section className="section section--narrow">
        <ProductFilter entries={entries} />
      </section>
    </>
  );
}
