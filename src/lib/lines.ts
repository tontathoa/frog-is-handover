import type { ProductLine } from './types';

export type LineInfo = {
  value: ProductLine;
  label: string;
  tagline: string;
  /** Short description, same wording as the printed catalog. */
  text: string;
  /** Background photo (the one used on the catalog's line opener) and its Unsplash credit. */
  photo: string;
  credit: string;
};

/** The two product lines, in display order. A product without a line is shared by both. */
export const PRODUCT_LINES: LineInfo[] = [
  {
    value: 'installation',
    label: 'Installation',
    tagline: 'Sound that belongs to the space.',
    text: 'Loudspeakers, subwoofers and amplifiers made for permanent installation in restaurants, bars, shops, hotels, schools and offices.',
    photo: '/img/lines/installation.jpg',
    credit: 'Shane Roten',
  },
  {
    value: 'performance',
    label: 'Performance',
    tagline: 'Power for the stage.',
    text: 'Point-source speakers, line arrays, subwoofers, amplifiers, processors, mixers and microphones for live sound, events and touring.',
    photo: '/img/lines/performance.jpg',
    credit: 'ActionVance',
  },
];

export function lineLabel(line: ProductLine | null | undefined): string {
  return PRODUCT_LINES.find((item) => item.value === line)?.label ?? '';
}

export function isProductLine(value: unknown): value is ProductLine {
  return value === 'installation' || value === 'performance';
}

/** /products/ for everything, /products/<line>/ for one line. */
export function lineHref(line: ProductLine | 'all'): string {
  return line === 'all' ? '/products/' : `/products/${line}/`;
}

/** A product without a line is shared: it counts under, and shows in, both lines. */
export function inLine(productLine: ProductLine | null, line: ProductLine | 'all'): boolean {
  return line === 'all' || productLine === null || productLine === line;
}
