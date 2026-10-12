'use client';

import { useState, type ReactNode } from 'react';

export type FilterEntry = { key: string; text: string; node: ReactNode };

/** Product grid with an instant client-side text filter; the cards themselves are server-rendered. */
export default function ProductFilter({ entries }: { entries: FilterEntry[] }) {
  const [query, setQuery] = useState('');
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (entry: FilterEntry) => terms.every((term) => entry.text.includes(term));
  const visible = entries.filter(matches).length;

  return (
    <>
      <div className="toolbar">
        <p className="toolbar__count">
          {visible} {visible === 1 ? 'product' : 'products'}
        </p>
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
