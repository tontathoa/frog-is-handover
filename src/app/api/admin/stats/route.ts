import { NextResponse } from 'next/server';
import { guard, route } from '@/lib/api';
import { query } from '@/lib/db';

export const GET = route(async (request: Request) => {
  await guard(request);
  const [[counts], latestProducts, latestPosts] = await Promise.all([
    query<Record<string, number>>(
      `SELECT (SELECT COUNT(*) FROM collections) AS collections,
              (SELECT COUNT(*) FROM products) AS products,
              (SELECT COUNT(*) FROM posts) AS posts,
              (SELECT COUNT(*) FROM messages WHERE is_read = 0) AS unreadMessages,
              (SELECT COUNT(*) FROM messages) AS messages,
              (SELECT COUNT(*) FROM subscribers) AS subscribers`,
    ),
    query('SELECT id, title, subtitle, slug, is_active, updated_at FROM products ORDER BY updated_at DESC, id DESC LIMIT 5'),
    query('SELECT id, title, slug, is_published, published_at FROM posts ORDER BY published_at DESC, id DESC LIMIT 5'),
  ]);
  return NextResponse.json({
    counts: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, Number(value)])),
    latestProducts: latestProducts.map((row) => ({
      id: Number(row.id),
      title: String(row.title),
      subtitle: String(row.subtitle ?? ''),
      slug: String(row.slug),
      isActive: Boolean(row.is_active),
      updatedAt: String(row.updated_at),
    })),
    latestPosts: latestPosts.map((row) => ({
      id: Number(row.id),
      title: String(row.title),
      slug: String(row.slug),
      isPublished: Boolean(row.is_published),
      publishedAt: String(row.published_at),
    })),
  });
});
