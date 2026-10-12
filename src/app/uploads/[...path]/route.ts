import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { PUBLIC_DIR } from '@/lib/media';

/**
 * Fallback for files under public/uploads that were added after the last build
 * (uploads from /admin). `next start` only serves the public files it found at
 * start-up; anything newer arrives here and is streamed from disk.
 */

const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  pdf: 'application/pdf',
  zip: 'application/zip',
};

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const file = path.resolve(UPLOADS_DIR, ...segments);
  if (!file.startsWith(UPLOADS_DIR + path.sep)) return new Response('Not found', { status: 404 });

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(file);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (!stat.isFile()) return new Response('Not found', { status: 404 });

  const extension = path.extname(file).slice(1).toLowerCase();
  const headers = new Headers({
    'Content-Type': TYPES[extension] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'Last-Modified': stat.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
  });
  // Anything that is not a known media type is offered as a download, never rendered.
  if (!TYPES[extension]) headers.set('Content-Disposition', `attachment; filename="${path.basename(file).replace(/"/g, '')}"`);

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream, { status: 206, headers });
  }

  headers.set('Content-Length', String(stat.size));
  return new Response(Readable.toWeb(fs.createReadStream(file)) as ReadableStream, { headers });
}
