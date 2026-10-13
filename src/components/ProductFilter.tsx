'use client';

import { useState, type ReactNode } from 'react';
import { PRODUCT_LINES } from '@/lib/lines';
import type { ProductLine } from '@/lib/types';

export type FilterEntry = { key: string; text: string; line: ProductLine | null; node: ReactNode };

/** Product grid with an instant client-side text filter; the cards themselves are server-rendered. */
export default function ProductFilter({ entries }: { entries: FilterEntry[] }) {
  const [query, setQuery] = useState('');
  const [line, setLine] = useState<ProductLine | 'all'>('all');
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  // a product without a line is shared: it shows under both lines
  const inLine = (entry: FilterEntry, value: ProductLine | 'all') => value === 'all' || entry.line === null || entry.line === value;
  const matches = (entry: FilterEntry) => inLine(entry, line) && terms.every((term) => entry.text.includes(term));
  // the line switch only makes sense when this list actually has both lines
  const hasBothLines = PRODUCT_LINES.every((item) => entries.some((entry) => entry.line === item.value));
  const visible = entries.filter(matches).length;

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
                onClick={() => setLine(item.value)}
              >
                {item.label}
                <span>{entries.filter((entry) => inLine(entry, item.value)).length}</span>
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
