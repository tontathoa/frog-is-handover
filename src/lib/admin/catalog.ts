import { badRequest, flag, httpUrl, int, mediaPath, notFoundError, str } from '../api';
import { toCollection, toDownload, toVideo } from '../content';
import { execute, query, queryOne, type SqlValue } from '../db';
import { slugify } from '../format';
import { cleanRichText } from '../sanitize';

type Body = Record<string, unknown>;

/** Runs a partial UPDATE from the columns collected by `assign`. */
async function applyUpdate(table: string, id: number, set: string[], values: SqlValue[], missing: string) {
  if (set.length === 0) throw badRequest('No changes to save');
  const result = await execute(`UPDATE ${table} SET ${set.join(', ')} WHERE id = ?`, [...values, id]);
  if (result.affectedRows === 0 && !(await queryOne(`SELECT id FROM ${table} WHERE id = ?`, [id]))) throw notFoundError(missing);
}

async function freeSlug(table: string, slug: string, ignoreId: number, label: string) {
  if (!slug) throw badRequest('Slug cannot be empty');
  if (await queryOne(`SELECT id FROM ${table} WHERE slug = ? AND id <> ?`, [slug, ignoreId])) throw badRequest(`Slug "${slug}" is already used by another ${label}`);
  return slug;
}

// ------------------------------------------------------------------ collections

export const collections = {
  async list() {
    const rows = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.collection_id = c.id) AS product_count
       FROM collections c ORDER BY c.sort_order, c.id`,
    );
    return { data: rows.map(toCollection) };
  },

  async create(body: Body) {
    const name = str(body.name, 200);
    if (!name) throw badRequest('Please enter a collection name');
    const slug = await freeSlug('collections', slugify(str(body.slug, 160) || name), 0, 'collection');
    const result = await execute(
      'INSERT INTO collections (slug, name, short_name, icon, icon_hover, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [slug, name, str(body.short, 100) || name, mediaPath(body.icon), mediaPath(body.iconHover), int(body.sortOrder), body.isActive === undefined ? 1 : flag(body.isActive)],
    );
    return { id: result.insertId };
  },

  async update(id: number, body: Body) {
    const set: string[] = [];
    const values: SqlValue[] = [];
    const assign = (column: string, value: SqlValue) => {
      set.push(`${column} = ?`);
      values.push(value);
    };
    if ('name' in body) {
      const name = str(body.name, 200);
      if (!name) throw badRequest('Please enter a collection name');
      assign('name', name);
    }
    if ('slug' in body) assign('slug', await freeSlug('collections', slugify(str(body.slug, 160)), id, 'collection'));
    if ('short' in body) assign('short_name', str(body.short, 100));
    if ('icon' in body) assign('icon', mediaPath(body.icon));
    if ('iconHover' in body) assign('icon_hover', mediaPath(body.iconHover));
    if ('sortOrder' in body) assign('sort_order', int(body.sortOrder));
    if ('isActive' in body) assign('is_active', flag(body.isActive));
    await applyUpdate('collections', id, set, values, 'Collection not found');
  },

  async remove(id: number) {
    const [{ total }] = await query<{ total: number }>('SELECT COUNT(*) AS total FROM products WHERE collection_id = ?', [id]);
    if (Number(total) > 0) throw badRequest(`This collection still has ${total} product(s) — move or delete them first`);
    const result = await execute('DELETE FROM collections WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Collection not found');
  },
};

// ------------------------------------------------------------------ application videos

export const videos = {
  async list() {
    return { data: (await query('SELECT * FROM videos ORDER BY sort_order, id')).map(toVideo) };
  },

  async create(body: Body) {
    const title = str(body.title, 300);
    if (!title) throw badRequest('Please enter a video title');
    const slug = await freeSlug('videos', slugify(str(body.slug, 200) || title), 0, 'video');
    const result = await execute(
      'INSERT INTO videos (slug, title, thumb, video_url, embed_url, duration, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        slug,
        title,
        mediaPath(body.thumb),
        mediaPath(body.video),
        httpUrl(body.embed),
        str(body.duration, 20),
        cleanRichText(body.description),
        int(body.sortOrder),
        body.isActive === undefined ? 1 : flag(body.isActive),
      ],
    );
    return { id: result.insertId };
  },

  async update(id: number, body: Body) {
    const set: string[] = [];
    const values: SqlValue[] = [];
    const assign = (column: string, value: SqlValue) => {
      set.push(`${column} = ?`);
      values.push(value);
    };
    if ('title' in body) {
      const title = str(body.title, 300);
      if (!title) throw badRequest('Please enter a video title');
      assign('title', title);
    }
    if ('slug' in body) assign('slug', await freeSlug('videos', slugify(str(body.slug, 200)), id, 'video'));
    if ('thumb' in body) assign('thumb', mediaPath(body.thumb));
    if ('video' in body) assign('video_url', mediaPath(body.video));
    if ('embed' in body) assign('embed_url', httpUrl(body.embed));
    if ('duration' in body) assign('duration', str(body.duration, 20));
    if ('description' in body) assign('description', cleanRichText(body.description));
    if ('sortOrder' in body) assign('sort_order', int(body.sortOrder));
    if ('isActive' in body) assign('is_active', flag(body.isActive));
    await applyUpdate('videos', id, set, values, 'Video not found');
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM videos WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Video not found');
  },
};

// ------------------------------------------------------------------ downloads (catalog, software, certificates)

export const downloads = {
  async list() {
    return { data: (await query('SELECT * FROM downloads ORDER BY sort_order, id')).map(toDownload) };
  },

  async create(body: Body) {
    const title = str(body.title, 300);
    if (!title) throw badRequest('Please enter a document name');
    const file = mediaPath(body.file);
    const remote = httpUrl(body.remote);
    if (!file && !remote) throw badRequest('Upload a file or enter a download link');
    const result = await execute('INSERT INTO downloads (title, file_url, remote_url, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)', [
      title,
      file,
      remote,
      mediaPath(body.image),
      int(body.sortOrder),
      body.isActive === undefined ? 1 : flag(body.isActive),
    ]);
    return { id: result.insertId };
  },

  async update(id: number, body: Body) {
    const set: string[] = [];
    const values: SqlValue[] = [];
    const assign = (column: string, value: SqlValue) => {
      set.push(`${column} = ?`);
      values.push(value);
    };
    if ('title' in body) {
      const title = str(body.title, 300);
      if (!title) throw badRequest('Please enter a document name');
      assign('title', title);
    }
    if ('file' in body) assign('file_url', mediaPath(body.file));
    if ('remote' in body) assign('remote_url', httpUrl(body.remote));
    if ('image' in body) assign('image', mediaPath(body.image));
    if ('sortOrder' in body) assign('sort_order', int(body.sortOrder));
    if ('isActive' in body) assign('is_active', flag(body.isActive));
    await applyUpdate('downloads', id, set, values, 'Document not found');
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM downloads WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Document not found');
  },
};

// ------------------------------------------------------------------ contact messages / newsletter

export const messages = {
  async list(params: URLSearchParams) {
    const limit = Math.min(Math.max(int(params.get('limit'), 20), 1), 100);
    const page = Math.max(int(params.get('page'), 1), 1);
    const [{ total }] = await query<{ total: number }>('SELECT COUNT(*) AS total FROM messages');
    const rows = await query('SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?', [limit, (page - 1) * limit]);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        email: String(row.email),
        company: String(row.company ?? ''),
        phone: String(row.phone ?? ''),
        message: String(row.message),
        isRead: Boolean(row.is_read),
        createdAt: String(row.created_at),
      })),
      pagination: { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    };
  },

  async update(id: number, body: Body) {
    if (!('isRead' in body)) throw badRequest('No changes to save');
    await applyUpdate('messages', id, ['is_read = ?'], [flag(body.isRead)], 'Message not found');
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM messages WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Message not found');
  },
};

export const subscribers = {
  async list() {
    const rows = await query('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC, id DESC LIMIT 2000');
    return { data: rows.map((row) => ({ id: Number(row.id), email: String(row.email), createdAt: String(row.created_at) })) };
  },

  async remove(id: number) {
    const result = await execute('DELETE FROM subscribers WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw notFoundError('Email not found');
  },
};
