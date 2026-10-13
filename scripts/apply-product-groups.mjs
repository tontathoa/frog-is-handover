// Applies data/product-groups.json to the database.   npm run db:groups
//
// For every product: its line (installation / performance / null = shared by both lines) and, for the few
// products that were re-homed, the collection they belong to. Safe to run again; it only touches those two columns.
import { connect, readJson } from './lib.mjs';

const groups = readJson('product-groups.json');
const db = await connect();

const [collections] = await db.query('SELECT id, slug FROM collections');
const collectionId = new Map(collections.map((c) => [c.slug, c.id]));

let updated = 0;
let moved = 0;
const missing = [];
let tail = 900; // re-homed products go to the end of their new collection
for (const [slug, group] of Object.entries(groups)) {
  const sets = ['product_line = ?'];
  const values = [group.line ?? null];
  if (group.collection) {
    const id = collectionId.get(group.collection);
    if (!id) {
      console.warn(`Skipped ${slug}: collection "${group.collection}" does not exist.`);
      continue;
    }
    sets.push('collection_id = ?', 'sort_order = ?');
    values.push(id, tail++);
  }
  const [result] = await db.query(`UPDATE products SET ${sets.join(', ')} WHERE slug = ?`, [...values, slug]);
  if (result.affectedRows === 0) missing.push(slug);
  else {
    updated += 1;
    if (group.collection) moved += 1;
  }
}

const [counts] = await db.query("SELECT COALESCE(product_line, 'shared') AS line, COUNT(*) AS n FROM products GROUP BY product_line");
console.log(`Product lines applied to ${updated} products (${moved} moved to another collection).`);
console.log(counts.map((row) => `${row.line}: ${row.n}`).join(' · '));
if (missing.length) console.warn(`Not found in the database: ${missing.join(', ')}`);
await db.end();
