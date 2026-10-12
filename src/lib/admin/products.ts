import { badRequest, flag, int, mediaPath, notFoundError, str } from '../api';
import { toProduct } from '../content';
import { execute, query, queryOne, type SqlValue } from '../db';
import { slugify } from '../format';
import { cleanRichText } from '../sanitize';
import type { Product } from '../types';
import { inlineToText, textToInline } from './text';

type Body = Record<string, unknown>;

/** Product as the editor sees it: feature lines and spec cells as plain text. */
function forEditor(product: Product, collectionId: number | null) {
  return {
    ...product,
    collectionId,
    features: product.features.map(inlineToText),
    applications: product.applications.map(inlineToText),
    specs: product.specs.map((section) => ({ title: inlineToText(section.title), rows: section.rows.map((row) => row.map(inlineToText)) })),
  };
}

const lines = (value: unknown, limit = 80): string[] =>
  (Array.isArray(value) ? value : [])
    .slice(0, limit)
    .map((line) => textToInline(String(line ?? '')))
    .filter(Boolean);

function images(value: unknown): string[] {
  const list = (Array.isArray(value) ? value : []).slice(0, 40).map(mediaPath).filter((path): path is string => path !== null);
  return [...new Set(list)];
}

function files(value: unknown): { label: string; file: string }[] {
  return (Array.isArray(value) ? value : []).slice(0, 30).flatMap((entry) => {
    const item = (entry ?? {}) as Body;
    const file = mediaPath(item.file);
    return file ? [{ label: str(item.label, 120) || 'Download', file }] : [];
  });
}

function specs(value: unknown): { title: string; rows: string[][] }[] {
  return (Array.isArray(value) ? value : []).slice(0, 30).flatMap((entry) => {
    const group = (entry ?? {}) as Body;
    const rows = (Array.isArray(group.rows) ? group.rows : [])
      .slice(0, 200)
      .map((row) => {
        const cells = Array.isArray(row) ? row : [];
        return [textToInline(String(cells[0] ?? ''), 500), textToInline(String(cells[1] ?? ''))];
      })
      .filter((row) => row[0] || row[1]);
    const title = textToInline(str(group.title, 255), 255);
    return rows.length || title ? [{ title, rows }] : [];
  });
}

async function collectionId(value: unknown): Promise<number | null> {
  if (value === null || value === undefined || value === '') return null;
  const id = int(value, 0);
  if (!(await queryOne('SELECT id FROM collections WHERE id = ?', [id]))) throw badRequest('Collection does not exist');
  return id;
}

async function uniqueSlug(value: unknown, title: string, ignoreId = 0): Promise<string> {
  const slug = slugify(str(value, 160) || title);
  if (!slug) throw badRequest('Slug cannot be empty');
  if (await queryOne('SELECT id FROM products WHERE slug = ? AND id <> ?', [slug, ignoreId])) {
    throw badRequest(`Slug "${slug}" is already used by another product`);
  }
  return slug;
}

export const products = {
  /** ?q=&collection=<id>&visibility=all|visible|hidden&page=&limit= */
  async list(params: URLSearchParams) {
    const limit = Math.min(Math.max(int(params.get('limit'), 30), 1), 100);
    const page = Math.max(int(params.get('page'), 1), 1);
    const where: string[] = [];
    const values: SqlValue[] = [];

    const q = (params.get('q') ?? '').trim().slice(0, 100);
    if (q) {
      where.push('(p.title LIKE ? OR p.subtitle LIKE ? OR p.slug LIKE ?)');
      const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
      values.push(like, like, like);
    }
    const collection = params.get('collection');
    if (collection === 'none') where.push('p.collection_id IS NULL');
    else if (collection) {
      where.push('p.collection_id = ?');
      values.push(int(collection));
    }
    const visibility = params.get('visibility');
    if (visibility === 'visible') where.push('p.is_active = 1');
    if (visibility === 'hidden') where.push('p.is_active = 0');

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM products p ${clause}`, values);
    const rows = await query(
      `SELECT p.id, p.slug, p.title, p.subtitle, p.images, p.is_active, p.is_new, p.sort_order, p.updated_at,
              c.id AS collection_id, c.name AS collection_name
       FROM products p LEFT JOIN collections c ON c.id = p.collection_id
       ${clause}
       ORDER BY (c.id IS NULL), c.sort_order, p.sort_order, p.id
       LIMIT ? OFFSET ?`,
      [...values, limit, (page - 1) * limit],
    );
    return {
      data: rows.map((row) => {
        let image: string | null = null;
        try {
          image = (JSON.parse(String(row.images ?? '[]')) as string[])[0] ?? null;
        } catch {
          image = null;
        }
        return {
          id: Number(row.id),
          slug: String(row.slug),
          title: String(row.title),
          subtitle: String(row.subtitle ?? ''),
          image,
          collectionId: row.collection_id === null ? null : Number(row.collection_id),
          collectionName: (row.collection_name as string | null) ?? null,
          isActive: Boolean(row.is_active),
          isNew: Boolean(row.is_new),
          sortOrder: Number(row.sort_order),
          updatedAt: String(row.updated_at),
        };
      }),
      pagination: { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    };
  },

  async get(id: number) {
    const row = await queryOne(
      'SELECT p.*, c.slug AS collection_slug FROM products p LEFT JOIN collections c ON c.id = p.collection_id WHERE p.id = ?',
      [id],
    );
    if (!row) throw notFoundError('Product not found');
    return forEditor(toProduct(row), row.collection_id === null ? null : Number(row.collection_id));
  },

  async create(body: Body) {
    const title = str(body.title);
    if (!title) throw badRequest('Please enter a product name');
    const slug = await uniqueSlug(body.slug, title);
    const result = await execute(
      `INSERT INTO products (collection_id, slug, title, subtitle, description, images, files, features, applications, specs, is_active, is_new, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        await collectionId(body.collectionId),
        slug,
        title,
        str(body.subtitle, 500),
        cleanRichText(body.description),
        JSON.stringify(images(body.images)),
        JSON.stringify(files(body.files)),
        JSON.stringify(lines(body.features)),
        JSON.stringify(lines(body.applications)),
        JSON.stringify(specs(body.specs)),
        body.isActive === undefined ? 1 : flag(body.isActive),
        flag(body.isNew),
        int(body.sortOrder),
      ],
    );
    return { id: result.insertId };
  },

  /** Partial update: only the fields present in the body change (each editor tab saves its own part). */
  async update(id: number, body: Body) {
    const current = await queryOne<{ title: string }>('SELECT title FROM products WHERE id = ?', [id]);
    if (!current) throw notFoundError('Product not found');

    const set: string[] = [];
    const values: SqlValue[] = [];
    const assign = (column: string, value: SqlValue) => {
      set.push(`${column} = ?`);
      values.push(value);
    };

    if ('title' in body) {
      const title = str(body.title);
      if (!title) throw badRequest('Please enter a product name');
      assign('title', title);
    }
    if ('slug' in body) assign('slug', await uniqueSlug(body.slug, str(body.title) || current.title, id));
    if ('subtitle' in body) assign('subtitle', str(body.subtitle, 500));
    if ('collectionId' in body) assign('collection_id', await collectionId(body.collectionId));
    if ('description' in body) assign('description', cleanRichText(body.description));
    if ('images' in body) assign('images', JSON.stringify(images(body.images)));
    if ('files' in body) assign('files', JSON.stringify(files(body.files)));
    if ('features' in body) assign('features', JSON.stringify(lines(body.features)));
    if ('applications' in body) assign('applications', JSON.stringify(lines(body.applications)));
    if ('specs' in body) assign('specs', JSON.stringify(specs(body.specs)));
    if ('isActive' in body) assign('is_active', flag(body.isActive));
    if ('isNew' in body) assign('is_new', flag(body.isNew));
    if ('sortOrder' in body) assign('sort_order', int(body.sortOrder));

    if (set.length === 0) throw badRequest('No changes to save');
    await execute(`UPDATE products SET ${set.join(', ')} WHERE id = ?`, [...values, id]);
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Product not found');
  },
};
