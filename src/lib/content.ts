import { cache } from 'react';
import { parseJson, query, queryOne, type Row, type SqlValue } from './db';
import { plain } from './format';
import type { AboutSection, Collection, ContactInfo, Download, Post, Product, ProductFile, Slide, Social, SpecSection, Video } from './types';

/**
 * Read side of the content database, used by the public pages.
 * Only visible content is returned here; the admin has its own queries in lib/admin.
 */

// ------------------------------------------------------------------ row mappers

export function toCollection(row: Row): Collection {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    short: String(row.short_name || row.name),
    icon: (row.icon as string | null) || null,
    iconHover: (row.icon_hover as string | null) || null,
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    productCount: Number(row.product_count ?? 0),
  };
}

export function toProduct(row: Row): Product {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ''),
    description: String(row.description ?? ''),
    images: parseJson<string[]>(row.images, []),
    files: parseJson<ProductFile[]>(row.files, []),
    features: parseJson<string[]>(row.features, []),
    applications: parseJson<string[]>(row.applications, []),
    specs: parseJson<SpecSection[]>(row.specs, []),
    collection: (row.collection_slug as string | null) ?? null,
    isNew: Boolean(row.is_new),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function toPost(row: Row): Post {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ''),
    content: String(row.content ?? ''),
    image: (row.featured_image as string | null) || null,
    isPublished: Boolean(row.is_published),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
  };
}

export function toVideo(row: Row): Video {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    thumb: (row.thumb as string | null) || null,
    duration: String(row.duration ?? ''),
    video: (row.video_url as string | null) || null,
    embed: (row.embed_url as string | null) || null,
    description: String(row.description ?? ''),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    publishedAt: String(row.published_at),
  };
}

export function toDownload(row: Row): Download {
  return {
    id: Number(row.id),
    title: String(row.title),
    file: (row.file_url as string | null) || null,
    remote: (row.remote_url as string | null) || null,
    image: (row.image as string | null) || null,
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  };
}

const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS collection_slug
  FROM products p
  LEFT JOIN collections c ON c.id = p.collection_id`;

// ------------------------------------------------------------------ collections / products

export const getCollections = cache(async (): Promise<Collection[]> => {
  const rows = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.collection_id = c.id AND p.is_active = 1) AS product_count
     FROM collections c
     WHERE c.is_active = 1
     ORDER BY c.sort_order, c.id`,
  );
  return rows.map(toCollection);
});

export async function getCollection(slug: string): Promise<Collection | null> {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}

/** Visible products, grouped by collection order, then by their own order. */
export const getProducts = cache(async (collectionSlug?: string): Promise<Product[]> => {
  const params: SqlValue[] = [];
  let where = 'WHERE p.is_active = 1 AND (c.id IS NULL OR c.is_active = 1)';
  if (collectionSlug) {
    where += ' AND c.slug = ?';
    params.push(collectionSlug);
  }
  const rows = await query(`${PRODUCT_SELECT} ${where} ORDER BY (c.id IS NULL), c.sort_order, p.sort_order, p.id`, params);
  return rows.map(toProduct);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const row = await queryOne(`${PRODUCT_SELECT} WHERE p.slug = ? AND p.is_active = 1`, [slug]);
  return row ? toProduct(row) : null;
});

export const getNewProducts = cache(async (): Promise<Product[]> => {
  const rows = await query(`${PRODUCT_SELECT} WHERE p.is_active = 1 AND p.is_new = 1 ORDER BY p.created_at DESC, p.id DESC LIMIT 16`);
  return rows.map(toProduct);
});

// ------------------------------------------------------------------ posts / videos / downloads

export const getPosts = cache(async (): Promise<Post[]> => {
  const rows = await query('SELECT * FROM posts WHERE is_published = 1 AND published_at <= NOW() ORDER BY published_at DESC, id DESC');
  return rows.map(toPost);
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const row = await queryOne('SELECT * FROM posts WHERE slug = ? AND is_published = 1 AND published_at <= NOW()', [slug]);
  return row ? toPost(row) : null;
});

export const getVideos = cache(async (): Promise<Video[]> => {
  const rows = await query('SELECT * FROM videos WHERE is_active = 1 ORDER BY sort_order, id');
  return rows.map(toVideo);
});

export async function getVideo(slug: string): Promise<Video | null> {
  return (await getVideos()).find((v) => v.slug === slug) ?? null;
}

export const getDownloads = cache(async (): Promise<Download[]> => {
  const rows = await query('SELECT * FROM downloads WHERE is_active = 1 ORDER BY sort_order, id');
  return rows.map(toDownload);
});

// ------------------------------------------------------------------ settings

export const getSetting = cache(async <T,>(key: string, fallback: T): Promise<T> => {
  const row = await queryOne<{ setting_value: string | null }>('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
  return parseJson<T>(row?.setting_value, fallback);
});

export const EMPTY_CONTACT: ContactInfo = { intro: '', address: [], phones: [], emails: [] };

export const getContactInfo = () => getSetting<ContactInfo>('contact', EMPTY_CONTACT);
export const getSocials = () => getSetting<Social[]>('socials', []);
export const getSlides = () => getSetting<Slide[]>('slides', []);
export const getAbout = () => getSetting<{ banner: string | null; sections: AboutSection[] }>('about', { banner: null, sections: [] });

// ------------------------------------------------------------------ search

export async function searchSite(input: string): Promise<{ products: Product[]; posts: Post[] }> {
  const terms = input.toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return { products: [], posts: [] };

  // Every term must appear somewhere; hits in the name outrank hits in the body text.
  const score = (fields: [number, string][]): number => {
    let total = 0;
    for (const term of terms) {
      let best = 0;
      for (const [weight, text] of fields) {
        if (weight > best && text.includes(term)) best = weight;
      }
      if (best === 0) return 0;
      total += best;
    }
    return total;
  };

  const [products, posts] = await Promise.all([getProducts(), getPosts()]);
  const ranked = products
    .map((product, index) => ({
      product,
      index,
      points: score([
        [4, `${product.title} ${product.slug}`.toLowerCase()],
        [2, product.subtitle.toLowerCase()],
        [1, plain(product.description).toLowerCase()],
      ]),
    }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points || a.index - b.index);

  return {
    products: ranked.map((entry) => entry.product),
    posts: posts.filter((post) => score([[2, post.title.toLowerCase()], [1, plain(post.content).toLowerCase()]]) > 0),
  };
}
