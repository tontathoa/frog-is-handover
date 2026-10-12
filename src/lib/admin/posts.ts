import { badRequest, flag, int, mediaPath, notFoundError, str } from '../api';
import { toPost } from '../content';
import { execute, query, queryOne, type SqlValue } from '../db';
import { excerpt as makeExcerpt, slugify } from '../format';
import { cleanRichText } from '../sanitize';

type Body = Record<string, unknown>;

/** "2026-10-11T09:30" (datetime-local) or "2026-10-11 09:30:00" -> MySQL DATETIME; empty -> now. */
function dateTime(value: unknown): string {
  const text = str(value, 30);
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/.exec(text);
  if (match) return `${match[1]} ${match[2]}:${match[3] ?? '00'}`;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
}

async function uniqueSlug(value: unknown, title: string, ignoreId = 0): Promise<string> {
  const slug = slugify(str(value, 200) || title);
  if (!slug) throw badRequest('Slug cannot be empty');
  if (await queryOne('SELECT id FROM posts WHERE slug = ? AND id <> ?', [slug, ignoreId])) {
    throw badRequest(`Slug "${slug}" is already used by another post`);
  }
  return slug;
}

export const posts = {
  /** ?q=&status=published|draft&page=&limit= (the status filter runs in SQL, so totals stay right) */
  async list(params: URLSearchParams) {
    const limit = Math.min(Math.max(int(params.get('limit'), 15), 1), 100);
    const page = Math.max(int(params.get('page'), 1), 1);
    const where: string[] = [];
    const values: SqlValue[] = [];

    const q = (params.get('q') ?? '').trim().slice(0, 100);
    if (q) {
      where.push('(title LIKE ? OR slug LIKE ?)');
      const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
      values.push(like, like);
    }
    const status = params.get('status');
    if (status === 'published') where.push('is_published = 1');
    if (status === 'draft') where.push('is_published = 0');

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM posts ${clause}`, values);
    const rows = await query(
      `SELECT id, slug, title, excerpt, featured_image, is_published, published_at, updated_at
       FROM posts ${clause}
       ORDER BY published_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, (page - 1) * limit],
    );
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        title: String(row.title),
        image: (row.featured_image as string | null) || null,
        isPublished: Boolean(row.is_published),
        publishedAt: String(row.published_at),
        updatedAt: String(row.updated_at),
      })),
      pagination: { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    };
  },

  async get(id: number) {
    const row = await queryOne('SELECT * FROM posts WHERE id = ?', [id]);
    if (!row) throw notFoundError('Post not found');
    return toPost(row);
  },

  async create(body: Body, userId: number) {
    const title = str(body.title, 300);
    if (!title) throw badRequest('Please enter a title');
    const content = cleanRichText(body.content);
    const result = await execute(
      `INSERT INTO posts (slug, title, excerpt, content, featured_image, is_published, published_at, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        await uniqueSlug(body.slug, title),
        title,
        str(body.excerpt, 1000) || makeExcerpt(content, 220),
        content,
        mediaPath(body.image),
        flag(body.isPublished),
        dateTime(body.publishedAt),
        userId,
      ],
    );
    return { id: result.insertId };
  },

  /** Partial update: a missing field is left untouched (so toggling "published" never wipes the body). */
  async update(id: number, body: Body) {
    const current = await queryOne<{ title: string }>('SELECT title FROM posts WHERE id = ?', [id]);
    if (!current) throw notFoundError('Post not found');

    const set: string[] = [];
    const values: SqlValue[] = [];
    const assign = (column: string, value: SqlValue) => {
      set.push(`${column} = ?`);
      values.push(value);
    };

    if ('title' in body) {
      const title = str(body.title, 300);
      if (!title) throw badRequest('Please enter a title');
      assign('title', title);
    }
    if ('slug' in body) assign('slug', await uniqueSlug(body.slug, str(body.title, 300) || current.title, id));
    if ('excerpt' in body) assign('excerpt', str(body.excerpt, 1000));
    if ('content' in body) assign('content', cleanRichText(body.content));
    if ('image' in body) assign('featured_image', mediaPath(body.image));
    if ('isPublished' in body) assign('is_published', flag(body.isPublished));
    if ('publishedAt' in body) assign('published_at', dateTime(body.publishedAt));

    if (set.length === 0) throw badRequest('No changes to save');
    await execute(`UPDATE posts SET ${set.join(', ')} WHERE id = ?`, [...values, id]);
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM posts WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Post not found');
  },
};
