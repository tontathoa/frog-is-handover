import { NextResponse } from 'next/server';
import assets from '@data/assets.json';
import { mediaUrl } from '@/lib/format';

// Old WordPress media URLs (data sheets are linked from other sites) -> the mirrored file.
const MIRRORED = assets as Record<string, string>;

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const local = MIRRORED[`https://www.frog-is.com/wp-content/uploads/${path.join('/')}`];
  if (!local) return new NextResponse('Not found', { status: 404 });
  return NextResponse.redirect(new URL(mediaUrl(local), request.url), 301);
}
