// Shared helpers for the command-line scripts in this folder.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(ROOT, name);
    if (fs.existsSync(file)) process.loadEnvFile(file);
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'frogis',
  };
}

/** Connection to the configured database; with `server: true` it connects without selecting one. */
export async function connect({ server = false } = {}) {
  const { database, ...rest } = loadEnv();
  return mysql.createConnection({
    ...rest,
    ...(server ? {} : { database }),
    charset: 'utf8mb4',
    multipleStatements: true,
    dateStrings: true,
  });
}

export function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
}
