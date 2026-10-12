import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getCollections, getPosts, getProducts, getVideos } from '@/lib/content';

const asDate = (value: string) => new Date(value.replace(' ', 'T') + 'Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products, posts, videos] = await Promise.all([getCollections(), getProducts(), getPosts(), getVideos()]);
  const url = (path: string) => `${site.origin}${path}`;

  return [
    ...['/', '/products/', '/applications/', '/news/', '/brochure/', '/about-us/', '/contact/'].map((path) => ({ url: url(path) })),
    ...collections.map((c) => ({ url: url(`/collection/${c.slug}/`) })),
    ...products.map((p) => ({ url: url(`/product/${encodeURIComponent(p.slug)}/`), lastModified: asDate(p.updatedAt) })),
    ...posts.map((p) => ({ url: url(`/${encodeURIComponent(p.slug)}/`), lastModified: asDate(p.updatedAt) })),
    ...videos.map((v) => ({ url: url(`/video/${v.slug}/`), lastModified: asDate(v.publishedAt) })),
  ];
}
