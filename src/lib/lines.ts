import type { ProductLine } from './types';

/** The two product lines, in display order. A product without a line is shared by both. */
export const PRODUCT_LINES: { value: ProductLine; label: string }[] = [
  { value: 'installation', label: 'Installation' },
  { value: 'performance', label: 'Performance' },
];

export function lineLabel(line: ProductLine | null | undefined): string {
  return PRODUCT_LINES.find((item) => item.value === line)?.label ?? '';
}

export function isProductLine(value: unknown): value is ProductLine {
  return value === 'installation' || value === 'performance';
}
