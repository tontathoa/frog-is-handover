import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { badRequest, guard, notFoundError, route } from '@/lib/api';
import { slugify } from '@/lib/format';
import { diskPath, trimPath } from '@/lib/media';

/**
 * POST /api/admin/upload/<type>   (multipart, field "file")
 * Stores the file under public/uploads/<type>/<yyyy>/<mm>/ and returns its path.
 */

const MB = 1024 * 1024;
const IMAGES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const RULES: Record<string, { extensions: string[]; maxBytes: number; trim?: boolean }> = {
  products: { extensions: IMAGES, maxBytes: 20 * MB, trim: true },
  posts: { extensions: IMAGES, maxBytes: 20 * MB },
  images: { extensions: IMAGES, maxBytes: 20 * MB },
  documents: { extensions: ['pdf', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'], maxBytes: 100 * MB },
  videos: { extensions: ['mp4', 'webm'], maxBytes: 200 * MB },
};

/**
 * Product shots usually sit on a white studio background with a wide margin.
 * When all four corners are white, save a cropped copy that the product cards use.
 */
async function writeTrimmed(buffer: Buffer, rel: string): Promise<void> {
  const image = sharp(buffer).rotate().flatten({ background: '#ffffff' });
  const { data, info } = await image.clone().raw().toBuffer({ resolveWithObject: true });
  if (info.width * info.height > 40_000_000) return;
  const corner = (x: number, y: number) => {
    const offset = (y * info.width + x) * info.channels;
    return Math.min(data[offset], data[offset + 1] ?? data[offset], data[offset + 2] ?? data[offset]);
  };
  const corners = [corner(1, 1), corner(info.width - 2, 1), corner(1, info.height - 2), corner(info.width - 2, info.height - 2)];
  let output = image;
  if (corners.every((value) => value >= 244)) {
    const trimmed = await image.clone().trim({ background: '#ffffff', threshold: 12 }).toBuffer({ resolveWithObject: true });
    const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.05);
    output = sharp(trimmed.data).extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' });
  }
  const target = diskPath(trimPath(rel));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await output.resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 88, progressive: true }).toFile(target);
}

export const POST = route(async (request: Request, { params }: { params: Promise<{ type: string }> }) => {
  await guard(request);
  const { type } = await params;
  const rule = Object.hasOwn(RULES, type) ? RULES[type] : undefined;
  if (!rule) throw notFoundError('Loại upload không hợp lệ');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw badRequest('Không đọc được file gửi lên');
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) throw badRequest('Chưa chọn file');
  if (file.size > rule.maxBytes) throw badRequest(`File quá lớn (tối đa ${Math.round(rule.maxBytes / MB)}MB)`);

  const extension = path.extname(file.name).slice(1).toLowerCase();
  if (!rule.extensions.includes(extension)) {
    throw badRequest(`Không hỗ trợ định dạng .${extension || '?'} — chỉ nhận: ${rule.extensions.join(', ')}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isImage = IMAGES.includes(extension);
  if (isImage) {
    // The extension alone proves nothing: make sure the bytes really are an image.
    try {
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) throw new Error('empty image');
    } catch {
      throw badRequest('File ảnh bị lỗi hoặc không đúng định dạng');
    }
  }

  const now = new Date();
  const stem = slugify(path.basename(file.name, path.extname(file.name))).slice(0, 60) || 'file';
  const name = `${stem}-${crypto.randomBytes(3).toString('hex')}.${extension}`;
  const rel = `uploads/${type}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${name}`;
  const target = diskPath(rel);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);

  if (rule.trim && isImage && extension !== 'gif') {
    try {
      await writeTrimmed(buffer, rel);
    } catch (error) {
      console.error('upload: could not create the trimmed copy', error);
    }
  }

  return NextResponse.json({ path: rel, url: `/${rel}`, filename: file.name, size: file.size });
});
