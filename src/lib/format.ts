/** Pure string helpers shared by server and client code. */

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function plain(html: string | null | undefined): string {
  const text = (html ?? '').replace(/<br\s*\/?>|<\/p>|<\/li>/gi, ' ').replace(/<[^>]+>/g, '');
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

export function excerpt(html: string | null | undefined, length = 160): string {
  const text = plain(html);
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  const space = cut.lastIndexOf(' ');
  return (space > 0 ? cut.slice(0, space) : cut).replace(/[ ,.;:]+$/, '') + '…';
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2023-12-15T10:00:00" -> "15 Dec 2023" (or "15 December 2023" with long = true). */
export function fmtDate(iso: string | null | undefined, long = false): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  if (!match) return '';
  const month = MONTHS[Number(match[2]) - 1] ?? '';
  return `${match[3]} ${long ? month : month.slice(0, 3)} ${match[1]}`;
}

/** Public URL of a stored media path ("uploads/2025/03/x.jpg" -> "/uploads/2025/03/x.jpg"). */
export function mediaUrl(rel: string | null | undefined): string {
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel)) return rel;
  return '/' + rel.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
}

/** Stored rich text: resolve media paths and internal links against the site root. */
export function rich(html: string | null | undefined): string {
  return (html ?? '')
    .replaceAll('{{site}}', '/')
    .replace(/(src|href)="uploads\//g, '$1="/uploads/')
    .replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" ');
}

export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function fileSizeLabel(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  return bytes >= 1048576 ? `${Math.round((bytes / 1048576) * 10) / 10} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
