import { decodeEntities } from '../format';

/**
 * Feature lines and spec cells are stored as inline HTML (text + <br>) because that is
 * what the public pages render, but they are edited as plain text in the admin.
 */

export function inlineToText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
}

export function textToInline(text: string, max = 2000): string {
  return text
    .slice(0, max)
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>');
}
