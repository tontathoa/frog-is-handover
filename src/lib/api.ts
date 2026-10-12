import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getSessionUser, type SessionUser } from './auth';

/** Plumbing shared by the /api/admin route handlers. */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new ApiError(400, message);
export const notFoundError = (message = 'Not found') => new ApiError(404, message);

/**
 * Signed-in admin for this request, or a 401.
 * State-changing requests must also come from this site (the session cookie is SameSite=Lax;
 * the Origin check closes the remaining cross-site cases).
 */
export async function guard(request: Request): Promise<SessionUser> {
  if (!['GET', 'HEAD'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) throw new ApiError(403, 'Invalid request');
  }
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, 'Your session has expired. Please sign in again.');
  return user;
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/** Wraps a handler: ApiError -> JSON error with its status; anything else -> logged, generic 500. */
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      const code = (error as { code?: string }).code;
      if (code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'This value already exists (duplicate slug or name)' }, { status: 409 });
      }
      console.error(`${request.method} ${new URL(request.url).pathname} failed`, error);
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
    }
  };
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw badRequest('Invalid data submitted');
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw notFoundError();
  return id;
}

/** Public pages are statically cached; call this after every content change. */
export function publish(): void {
  revalidatePath('/', 'layout');
}

// ------------------------------------------------------------------ input coercion

export const str = (value: unknown, max = 255): string => (typeof value === 'string' ? value.trim().slice(0, max) : '');
export const flag = (value: unknown): number => (value === true || value === 1 || value === '1' ? 1 : 0);
export const int = (value: unknown, fallback = 0): number => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
};

/** A stored media path ("uploads/..." without leading slash), or null. */
export function mediaPath(value: unknown): string | null {
  const path = str(value, 500).replace(/^\/+/, '');
  if (!path) return null;
  if (!/^uploads\/[A-Za-z0-9._\-/]+$/.test(path) || path.includes('..')) throw badRequest('Invalid file path');
  return path;
}

export function httpUrl(value: unknown): string | null {
  const url = str(value, 500);
  if (!url) return null;
  if (!/^https?:\/\/[^\s<>"']+$/i.test(url)) throw badRequest('URL must start with http:// or https://');
  return url;
}
