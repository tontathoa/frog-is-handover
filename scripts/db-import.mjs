// Loads the scraped content (data/*.json) into the database.   npm run db:import [-- --force]
//
// This REPLACES collections, products, posts, videos, downloads and the content settings.
// Once the site is being edited in /admin, running it again would discard those edits,
// so it refuses to touch a non-empty database unless --force is given.
import { connect, readJson } from './lib.mjs';

const force = process.argv.includes('--force');
const db = await connect();

const [[{ existing }]] = await db.query('SELECT (SELECT COUNT(*) FROM products) + (SELECT COUNT(*) FROM posts) AS existing');
if (existing > 0 && !force) {
  console.error(`The database already holds ${existing} products/posts. Re-run with "-- --force" to replace them with data/*.json.`);
  await db.end();
  process.exit(1);
}

const SHORT_NAMES = {
  'point-source-speakers': 'Point source',
  'slimline-array-speaker-systems': 'Slimline array',
  'high-performance-array-speaker-systems': 'High performance array',
  'ceiling-speakers': 'Ceiling',
  subwoofers: 'Subwoofers',
  'amplifier-mixer': 'Amplifier & Mixer',
  'microphones-headphones': 'Microphones',
  accessories: 'Accessories',
};

// The old slider had no text; these captions give each slide a headline and a link.
const HERO_CAPTIONS = [
  { title: 'Frog-is', text: 'Architects favorite audio brand', cta: 'Discover our products', href: '/products/' },
  { title: 'Applications', text: 'Frog-is systems at work', cta: 'Browse it!', href: '/applications/' },
  { title: 'Outdoor', text: 'Slimline array speaker systems', cta: 'Find out more!', href: '/collection/slimline-array-speaker-systems/' },
];

const toDateTime = (iso) => (iso ? iso.replace('T', ' ').slice(0, 19) : new Date().toISOString().replace('T', ' ').slice(0, 19));
const json = (value) => JSON.stringify(value ?? []);
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const collections = readJson('collections.json');
const products = readJson('products.json');
const posts = readJson('posts.json');
const videos = readJson('videos.json');
const downloads = readJson('downloads.json');
const pages = readJson('pages.json');
const site = readJson('site.json');

await db.beginTransaction();
try {
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of ['products', 'collections', 'posts', 'videos', 'downloads']) {
    await db.query(`DELETE FROM ${table}`);
    await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
  }
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // collections, in the order the old site showed them
  const collectionId = new Map();
  const position = new Map(); // product slug -> [collection slug, index]
  for (const [index, c] of collections.entries()) {
    const [result] = await db.query(
      'INSERT INTO collections (slug, name, short_name, icon, icon_hover, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [c.slug, c.name, SHORT_NAMES[c.slug] ?? c.name, c.icon, c.icon_hover, index + 1],
    );
    collectionId.set(c.slug, result.insertId);
    c.products.forEach((slug, i) => {
      if (!position.has(slug)) position.set(slug, [c.slug, i + 1]);
    });
  }

  const fresh = new Set(site.new_products ?? []);
  for (const p of products) {
    const tab = (type) => p.tabs.find((t) => t.type === type) ?? {};
    const [collectionSlug, order] = position.get(p.slug) ?? [p.collections?.[0], 999];
    const specs = (tab('specifications').sections ?? [])
      .filter((s) => s.rows.length)
      .map((s) => ({ title: s.title, rows: s.rows.map((row) => [row[0] ?? '', row.slice(1).join('<br>')]) }));
    await db.query(
      `INSERT INTO products (collection_id, slug, title, subtitle, description, images, files, features, applications, specs,
                             is_active, is_new, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        collectionId.get(collectionSlug) ?? null,
        p.slug,
        p.title,
        p.subtitle ?? '',
        p.description ?? '',
        json(p.images),
        json(p.files),
        json(tab('features').items),
        json(tab('applications').items),
        json(specs),
        fresh.has(p.slug) ? 1 : 0,
        order,
        toDateTime(p.date),
        toDateTime(p.modified || p.date),
      ],
    );
  }

  for (const post of posts) {
    await db.query(
      `INSERT INTO posts (slug, title, excerpt, content, featured_image, is_published, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [post.slug, post.title, post.excerpt ?? '', post.content ?? '', post.image, toDateTime(post.date), toDateTime(post.date), toDateTime(post.modified || post.date)],
    );
  }

  for (const [index, v] of videos.entries()) {
    await db.query(
      'INSERT INTO videos (slug, title, thumb, video_url, embed_url, duration, description, sort_order, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [v.slug, v.title, v.thumb, v.video, v.embed, v.duration ?? '', v.description ?? '', index + 1, toDateTime(v.date)],
    );
  }

  for (const [index, d] of downloads.entries()) {
    await db.query('INSERT INTO downloads (title, file_url, remote_url, image, sort_order) VALUES (?, ?, ?, ?, ?)', [
      d.title.trim(),
      d.file,
      d.remote,
      d.image,
      index + 1,
    ]);
  }

  // contact block: free text lines from the old Contact page -> structured fields
  const contact = { intro: '', address: [], phones: [], emails: pages.contact.emails.map((m) => ({ label: capitalize(m.label.replace(/^For /i, '')), email: m.email })) };
  pages.contact.lines.forEach((line, i) => {
    let match;
    if ((match = /^(HK )?Tel\s*:\s*(.+)$/i.exec(line))) {
      contact.phones.push({ label: match[1] ? 'Hong Kong' : 'Office', number: match[2].trim() });
    } else if ((match = /^Company address\s*:\s*(.+)$/i.exec(line))) {
      contact.address.push(match[1].trim());
    } else if (line.startsWith('For ')) {
      // e-mail lines are already covered by pages.contact.emails
    } else if (i === 0) {
      contact.intro = line;
    } else if (contact.address.length) {
      contact.address.push(line);
    }
  });

  // the old footer pointed its Twitter / LinkedIn icons at frog-is.com itself; keep only real profiles
  const socials = (site.socials ?? [])
    .filter((s) => !/^https?:\/\/(www\.)?frog-is\.com\/?$/i.test(s.href))
    .map((s) => ({ network: s.network.replace(/-(f|in)$/, ''), href: s.href }));

  const settings = {
    contact,
    socials,
    slides: (site.slides ?? []).map((s, i) => ({ image: s.image, title: s.title ?? '', text: '', cta: '', href: '', ...HERO_CAPTIONS[i] })),
    about: pages.about,
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [
      key,
      JSON.stringify(value),
    ]);
  }

  await db.commit();
  console.log(
    `Imported ${collections.length} collections, ${products.length} products, ${posts.length} posts, ${videos.length} videos, ${downloads.length} downloads.`,
  );
} catch (error) {
  await db.rollback();
  console.error('Import failed, nothing was changed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
