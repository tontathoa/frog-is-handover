import fs from 'node:fs';
import path from 'node:path';
import { mediaUrl } from './format';

/** Server-only helpers for files stored under public/. */

export const PUBLIC_DIR = path.join(process.cwd(), 'public');

export function diskPath(rel: string): string {
  return path.join(PUBLIC_DIR, ...rel.replace(/^\/+/, '').split('/'));
}

function onDisk(rel: string): boolean {
  try {
    return fs.statSync(diskPath(rel)).isFile();
  } catch {
    return false;
  }
}

/** "uploads/2025/03/x.png" -> "uploads/_trim/2025/03/x.jpg" (white studio margin cropped away). */
export function trimPath(rel: string): string {
  return rel.replace(/^uploads\//, 'uploads/_trim/').replace(/\.[A-Za-z0-9]+$/, '.jpg');
}

/** URL of a product shot, preferring its trimmed variant when one has been generated. */
export function productShot(rel: string | null | undefined): string {
  if (!rel) return '';
  const trimmed = trimPath(rel);
  return mediaUrl(trimmed !== rel && onDisk(trimmed) ? trimmed : rel);
}

export function fileSize(rel: string | null | undefined): number | null {
  if (!rel) return null;
  try {
    return fs.statSync(diskPath(rel)).size;
  } catch {
    return null;
  }
}
