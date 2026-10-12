/** Browser-side client for /api/admin. The session travels in an httpOnly cookie, so there is no token to manage. */

export class ApiFailure extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** "products?q=x" -> "/api/admin/products/?q=x" (the site uses trailing slashes; this avoids a redirect per call). */
function endpoint(path: string): string {
  const [route, search] = path.split('?');
  return `/api/admin/${route.replace(/^\/+|\/+$/g, '')}/${search ? `?${search}` : ''}`;
}

async function parse<T>(response: Response, path: string): Promise<T> {
  if (response.status === 401 && !path.startsWith('auth/')) {
    // Session expired: a full page load (not a client-side transition) so every cached admin screen is dropped.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/admin/login/';
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new ApiFailure(data.error ?? `Something went wrong (${response.status})`, response.status);
  return data as T;
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(endpoint(path), {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parse<T>(response, path);
}

export type Uploaded = { path: string; url: string; filename: string; size: number };

export const api = {
  get: <T>(path: string) => send<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => send<T>('POST', path, body),
  put: <T = { success: true }>(path: string, body: unknown) => send<T>('PUT', path, body),
  del: <T = { success: true }>(path: string) => send<T>('DELETE', path),
  async upload(type: string, file: File): Promise<Uploaded> {
    const form = new FormData();
    form.append('file', file);
    const path = `upload/${type}`;
    return parse<Uploaded>(await fetch(endpoint(path), { method: 'POST', credentials: 'same-origin', body: form }), path);
  },
};

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : 'Something went wrong');

export type Paginated<T> = { data: T[]; pagination: { total: number; page: number; limit: number; pages: number } };
