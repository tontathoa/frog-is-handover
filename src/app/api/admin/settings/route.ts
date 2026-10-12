import { NextResponse } from 'next/server';
import { badRequest, guard, httpUrl, mediaPath, publish, readBody, route, str } from '@/lib/api';
import { EMPTY_CONTACT } from '@/lib/content';
import { execute, parseJson, query } from '@/lib/db';
import type { ContactInfo, Slide, Social } from '@/lib/types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const list = (value: unknown, limit: number): Record<string, unknown>[] =>
  (Array.isArray(value) ? value : []).slice(0, limit).map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>) : {}));

function contact(value: unknown): ContactInfo {
  const input = (value ?? {}) as Record<string, unknown>;
  return {
    intro: str(input.intro, 500),
    address: (Array.isArray(input.address) ? input.address : []).slice(0, 6).map((line) => str(line, 200)).filter(Boolean),
    phones: list(input.phones, 8)
      .map((phone) => ({ label: str(phone.label, 60), number: str(phone.number, 40) }))
      .filter((phone) => phone.number),
    emails: list(input.emails, 8)
      .map((mail) => ({ label: str(mail.label, 60), email: str(mail.email, 190).toLowerCase() }))
      .filter((mail) => {
        if (!mail.email) return false;
        if (!EMAIL.test(mail.email)) throw badRequest(`Invalid email: ${mail.email}`);
        return true;
      }),
  };
}

function socials(value: unknown): Social[] {
  return list(value, 10).flatMap((item) => {
    const href = httpUrl(item.href);
    const network = str(item.network, 30).toLowerCase();
    return href && network ? [{ network, href }] : [];
  });
}

/** Internal path ("/products/") or absolute http(s) URL. */
function link(value: unknown): string {
  const href = str(value, 300);
  if (!href) return '';
  if (/^\/(?!\/)[^\s<>"']*$/.test(href)) return href;
  return httpUrl(href) ?? '';
}

function slides(value: unknown): Slide[] {
  return list(value, 10).flatMap((item) => {
    const image = mediaPath(item.image);
    return image ? [{ image, title: str(item.title, 120), text: str(item.text, 200), cta: str(item.cta, 60), href: link(item.href) }] : [];
  });
}

const EDITABLE = { contact, socials, slides } as const;
type Key = keyof typeof EDITABLE;

export const GET = route(async (request: Request) => {
  await guard(request);
  const rows = await query<{ setting_key: string; setting_value: string | null }>(
    "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('contact', 'socials', 'slides')",
  );
  const stored = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
  return NextResponse.json({
    contact: parseJson<ContactInfo>(stored.contact, EMPTY_CONTACT),
    socials: parseJson<Social[]>(stored.socials, []),
    slides: parseJson<Slide[]>(stored.slides, []),
  });
});

/** Saves whichever of contact / socials / slides are present in the body. */
export const PUT = route(async (request: Request) => {
  await guard(request);
  const body = await readBody(request);
  const keys = (Object.keys(EDITABLE) as Key[]).filter((key) => key in body);
  if (keys.length === 0) throw badRequest('No changes to save');

  for (const key of keys) {
    await execute('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [
      key,
      JSON.stringify(EDITABLE[key](body[key])),
    ]);
  }
  publish();
  return NextResponse.json({ success: true });
});
