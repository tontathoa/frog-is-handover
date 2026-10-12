import sanitizeHtml from 'sanitize-html';

/** Rich text coming from the admin editor is cleaned on the way in, so stored HTML is always safe to render. */

const TEXT_ALIGN = [/^(left|right|center|justify)$/];

export function cleanRichText(html: unknown): string {
  if (typeof html !== 'string') return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
      'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'code', 'hr',
      'ul', 'ol', 'li', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      '*': ['style'],
    },
    allowedStyles: { '*': { 'text-align': TEXT_ALIGN } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener' } : attribs,
      }),
    },
  }).trim();
}

/** One line of a feature list or a spec value: inline formatting only. */
export function cleanInline(html: unknown, max = 2000): string {
  if (typeof html !== 'string') return '';
  return sanitizeHtml(html.slice(0, max), {
    allowedTags: ['b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'br', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  }).trim();
}
