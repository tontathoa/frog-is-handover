import mysql, { type Pool, type ResultSetHeader } from 'mysql2/promise';

// One pool per process; kept on globalThis so dev hot-reloads don't leak connections.
const store = globalThis as unknown as { __frogisPool?: Pool };

export function pool(): Pool {
  store.__frogisPool ??= mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'frogis',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
  return store.__frogisPool;
}

export type Row = Record<string, unknown>;
export type SqlValue = string | number | boolean | null | Date;

/** SELECT helper; values are always passed as placeholders, never interpolated. */
export async function query<T = Row>(sql: string, params: SqlValue[] = []): Promise<T[]> {
  const [rows] = await pool().query(sql, params);
  return rows as T[];
}

export async function queryOne<T = Row>(sql: string, params: SqlValue[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}

/** INSERT / UPDATE / DELETE helper. */
export async function execute(sql: string, params: SqlValue[] = []): Promise<ResultSetHeader> {
  const [result] = await pool().query(sql, params);
  return result as ResultSetHeader;
}

/** JSON stored in a LONGTEXT column (MariaDB returns text, MySQL may return a parsed value). */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
