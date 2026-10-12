import Form from 'next/form';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import ProductCard from '@/components/ProductCard';
import { getCollections, searchSite } from '@/lib/content';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({ title: 'Search', path: '/search/', noindex: true });

type Props = { searchParams: Promise<{ s?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).s;
  const query = (Array.isArray(raw) ? raw[0] : (raw ?? '')).trim().slice(0, 100);
  const [results, collections] = await Promise.all([searchSite(query), getCollections()]);
  const shortName = new Map(collections.map((c) => [c.slug, c.short]));
  const total = results.products.length + results.posts.length;

  return (
    <>
      <div className="page-head">
        <h1 className="display">Search</h1>
        <Form className="page-head__search" action="/search/" role="search">
          <label className="sr-only" htmlFor="search-page">
            Search
          </label>
          <input id="search-page" type="search" name="s" defaultValue={query} placeholder="Search products, news…" />
          <button className="btn btn--dark" type="submit">
            Search
          </button>
        </Form>
        {query && (
          <p className="page-head__lead">
            {total} {total === 1 ? 'result' : 'results'} for “{query}”
          </p>
        )}
      </div>

      {results.products.length > 0 && (
        <section className="section section--narrow">
          <div className="section__head">
            <h2 className="section__title">Products</h2>
          </div>
          <div className="pgrid">
            {results.products.map((p) => (
              <ProductCard key={p.slug} product={p} label={shortName.get(p.collection ?? '')} />
            ))}
          </div>
        </section>
      )}

      {results.posts.length > 0 && (
        <section className="section section--narrow">
          <div className="section__head">
            <h2 className="section__title">News</h2>
          </div>
          <div className="ngrid">
            {results.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {query && total === 0 && (
        <section className="section section--narrow">
          <p className="empty">
            Nothing found. Try a model number such as “FI-SUB12” or browse <Link href="/products/">all products</Link>.
          </p>
        </section>
      )}
    </>
  );
}
