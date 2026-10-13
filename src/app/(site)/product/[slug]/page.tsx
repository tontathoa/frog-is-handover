import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Crumbs from '@/components/Crumbs';
import Gallery from '@/components/Gallery';
import ProductCard from '@/components/ProductCard';
import Rail from '@/components/Rail';
import { site } from '@/config/site';
import { getCollection, getProduct, getProducts } from '@/lib/content';
import { excerpt, fileSizeLabel, mediaUrl, rich } from '@/lib/format';
import { lineLabel } from '@/lib/lines';
import { fileSize, productShot } from '@/lib/media';
import { pageMeta } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

const decode = (slug: string) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(decode((await params).slug));
  if (!product) return {};
  return pageMeta({
    title: product.subtitle ? `${product.title} — ${product.subtitle}` : product.title,
    description: excerpt(product.description || product.subtitle, 170),
    path: `/product/${encodeURIComponent(product.slug)}/`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(decode((await params).slug));
  if (!product) notFound();

  const collection = product.collection ? await getCollection(product.collection) : null;
  const siblings = collection ? await getProducts(collection.slug) : [];
  const related = siblings.filter((p) => p.slug !== product.slug);
  const specs = product.specs.filter((section) => section.rows.length > 0);
  const enquiry = `/contact/?product=${encodeURIComponent(product.title)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: excerpt(product.description || product.subtitle, 300),
    sku: product.title,
    brand: { '@type': 'Brand', name: site.name },
    ...(collection ? { category: collection.name } : {}),
    image: product.images.map((image) => site.origin + mediaUrl(image)),
  };

  return (
    <>
      <Crumbs
        trail={[
          ...(collection ? [{ label: collection.short, href: `/collection/${collection.slug}/` }] : []),
          { label: product.title },
        ]}
      >
        {product.files.map((file) => (
          <a key={file.file} className="btn btn--light btn--sm" href={mediaUrl(file.file)} target="_blank" rel="noopener">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 1v8M3.5 6L7 9.5 10.5 6M1.5 12.5h11" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {file.label}
          </a>
        ))}
        <Link className="btn btn--light btn--sm" href={enquiry}>
          Enquire
        </Link>
      </Crumbs>

      <article className="pdp">
        <Gallery images={product.images.map((image) => productShot(image))} title={product.title} />

        <div className="pdp__info">
          <p className="label">
            {collection?.name ?? 'Product'}
            {product.line && <span className={`pdp__line pdp__line--${product.line}`}>{lineLabel(product.line)}</span>}
          </p>
          <h1 className="pdp__title">{product.title}</h1>
          {product.subtitle && <p className="pdp__sub">{product.subtitle}</p>}
          {product.description && <div className="prose" dangerouslySetInnerHTML={{ __html: rich(product.description) }} />}

          {product.features.length > 0 && (
            <>
              <h2 className="pdp__h">Features</h2>
              <ul className="bullets">
                {product.features.map((line, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: rich(line) }} />
                ))}
              </ul>
            </>
          )}

          {product.applications.length > 0 && (
            <>
              <h2 className="pdp__h">Applications</h2>
              <ul className="bullets">
                {product.applications.map((line, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: rich(line) }} />
                ))}
              </ul>
            </>
          )}

          <div className="pdp__cta">
            {specs.length > 0 && (
              <a className="btn btn--dark" href="#specifications">
                Specifications
              </a>
            )}
            <Link className="btn btn--outline" href={enquiry}>
              Contact sales
            </Link>
          </div>
        </div>
      </article>

      {specs.length > 0 && (
        <section className="section section--narrow specs" id="specifications">
          <h2 className="section__title">Specifications</h2>
          {specs.map((section, i) => {
            // A lone "Specification(s)" group would only repeat the section heading.
            const redundant = specs.length === 1 && /^specifications?$/i.test(section.title.trim());
            return (
              <table key={i} className="spec-table">
                {section.title && !redundant && <caption>{section.title}</caption>}
                <tbody>
                  {section.rows.map((row, r) => (
                    <tr key={r}>
                      <th scope="row" dangerouslySetInnerHTML={{ __html: rich(row[0] ?? '') }} />
                      <td dangerouslySetInnerHTML={{ __html: rich(row.slice(1).join('<br>')) }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })}
        </section>
      )}

      {product.files.length > 0 && (
        <section className="section section--flush" id="downloads">
          <div className="dl">
            <h2 className="section__title">Downloads</h2>
            <div className="dl__list">
              {product.files.map((file) => {
                const size = fileSizeLabel(fileSize(file.file));
                return (
                  <a key={file.file} className="dl__item" href={mediaUrl(file.file)} target="_blank" rel="noopener">
                    <span className="dl__kind">{(file.file.split('.').pop() ?? '').toUpperCase().slice(0, 4)}</span>
                    <span className="dl__name">{file.label}</span>
                    <span className="dl__meta">
                      {product.title}
                      {size && ` · ${size}`}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {collection && related.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">More {collection.name.toLowerCase()}</h2>
            <Link className="link-arrow" href={`/collection/${collection.slug}/`}>
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Rail>
            {related.slice(0, 12).map((p) => (
              <ProductCard key={p.slug} product={p} label={collection.short} compact />
            ))}
          </Rail>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
