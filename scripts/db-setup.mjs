// Creates the database (if missing) and applies database/schema.sql.   npm run db:setup
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, connect, loadEnv } from './lib.mjs';

const { database } = loadEnv();
if (!/^[A-Za-z0-9_]+$/.test(database)) {
  console.error(`DB_NAME "${database}" may only contain letters, digits and underscores.`);
  process.exit(1);
}

const server = await connect({ server: true });
await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await server.end();

const db = await connect();
await db.query(fs.readFileSync(path.join(ROOT, 'database', 'schema.sql'), 'utf8'));
const [hasLine] = await db.query(
  "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'product_line'",
);
if (hasLine.length === 0) {
  await db.query('ALTER TABLE products ADD COLUMN product_line VARCHAR(20) NULL AFTER is_new');
  console.log('Added products.product_line.');
}
const [tables] = await db.query('SHOW TABLES');
await db.end();

console.log(`Database "${database}" is ready (${tables.length} tables).`);
