'use client';

import { useState, type ReactNode } from 'react';
import { inLine, lineHref, PRODUCT_LINES } from '@/lib/lines';
import type { ProductLine } from '@/lib/types';

export type FilterEntry = { key: string; text: string; line: ProductLine | null; node: ReactNode };

type Props = {
  entries: FilterEntry[];
  /** Line switched on when the page opens (/products/installation/ and /products/performance/). */
  initialLine?: ProductLine;
  /** When set, switching line also rewrites the address bar to /products/ or /products/<line>/. */
  syncUrl?: boolean;
};

/** Product grid with an instant client-side text filter; the cards themselves are server-rendered. */
export default function ProductFilter({ entries, initialLine, syncUrl = false }: Props) {
  const [query, setQuery] = useState('');
  const [line, setLine] = useState<ProductLine | 'all'>(initialLine ?? 'all');
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (entry: FilterEntry) => inLine(entry.line, line) && terms.every((term) => entry.text.includes(term));
  // the line switch only makes sense when this list actually has both lines
  const hasBothLines = PRODUCT_LINES.every((item) => entries.some((entry) => entry.line === item.value));
  const visible = entries.filter(matches).length;

  const chooseLine = (value: ProductLine | 'all') => {
    setLine(value);
    // keep the address in step with what is shown, without a navigation (reloading gives the same list)
    if (syncUrl) window.history.replaceState(null, '', lineHref(value));
  };

  return (
    <>
      <div className="toolbar">
        <p className="toolbar__count">
          {visible} {visible === 1 ? 'product' : 'products'}
        </p>
        {hasBothLines && (
          <div className="linefilter" role="group" aria-label="Product line">
            {[{ value: 'all' as const, label: 'All' }, ...PRODUCT_LINES].map((item) => (
              <button
                key={item.value}
                type="button"
                className={`linefilter__btn${line === item.value ? ' is-active' : ''}`}
                aria-pressed={line === item.value}
                onClick={() => chooseLine(item.value)}
              >
                {item.label}
                <span>{entries.filter((entry) => inLine(entry.line, item.value)).length}</span>
              </button>
            ))}
          </div>
        )}
        <div className="toolbar__filter">
          <label className="sr-only" htmlFor="product-filter">
            Filter products
          </label>
          <input
            id="product-filter"
            type="search"
            placeholder="Filter by model or keyword"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="pgrid">
        {entries.map((entry) => (
          <div key={entry.key} className="pgrid__cell" hidden={!matches(entry)}>
            {entry.node}
          </div>
        ))}
      </div>
      {visible === 0 && <p className="empty">No product matches your filter.</p>}
    </>
  );
}
