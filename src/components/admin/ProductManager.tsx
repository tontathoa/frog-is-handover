'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorText, type Paginated } from './api';
import { Empty, Loading, PageHead, SearchInput, mediaSrc } from './ui';
import { PRODUCT_LINES, lineLabel } from '@/lib/lines';
import type { ProductLine } from '@/lib/types';

type Row = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image: string | null;
  collectionName: string | null;
  line: ProductLine | null;
  isActive: boolean;
  isNew: boolean;
};
type CollectionOption = { id: number; name: string };

const PER_FETCH = 30;
const LINE_BADGE: Record<ProductLine, string> = { installation: 'adm-badge--blue', performance: 'adm-badge--primary', portable: 'adm-badge--amber' };

export default function ProductManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [q, setQ] = useState('');
  const [collection, setCollection] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [line, setLine] = useState('');
  const [filterKey, setFilterKey] = useState(0);
  const request = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ data: CollectionOption[] }>('collections')
      .then((response) => setCollections(response.data))
      .catch(() => undefined);
  }, []);

  const load = useCallback(
    (nextPage: number) => {
      const id = (request.current += 1);
      const params = new URLSearchParams({ page: String(nextPage), limit: String(PER_FETCH), visibility });
      if (q) params.set('q', q);
      if (collection) params.set('collection', collection);
      if (line) params.set('line', line);
      api
        .get<Paginated<Row>>(`products?${params}`)
        .then((response) => {
          if (id !== request.current) return; // a newer request superseded this one
          setError('');
          setRows((current) => (nextPage === 1 ? response.data : [...current, ...response.data]));
          setTotal(response.pagination.total);
          setPage(nextPage);
        })
        .catch((failure) => {
          if (id === request.current) setError(errorText(failure));
        })
        .finally(() => {
          if (id === request.current) setLoading(false);
        });
    },
    [q, collection, visibility, line],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  // Load the next batch when the end of the table scrolls into view.
  const hasMore = rows.length < total;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setLoading(true);
        load(page + 1);
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, load, page]);

  const toggle = async (row: Row, field: 'isActive' | 'isNew') => {
    const value = !row[field];
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, [field]: value } : item)));
    try {
      await api.put(`products/${row.id}`, { [field]: value });
    } catch (failure) {
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, [field]: !value } : item)));
      window.alert(errorText(failure));
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete product "${row.title}"?\n\nThis cannot be undone. If you only want to hide it for now, untick "Visible" instead.`)) return;
    try {
      await api.del(`products/${row.id}`);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setTotal((count) => count - 1);
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  /** Filter setters: show the spinner right away; the effect above then reloads from page 1. */
  const filter = (apply: () => void) => {
    setLoading(true);
    apply();
  };
  const filtered = Boolean(q || collection || line || visibility !== 'all');
  const clearFilters = () => {
    setLoading(true);
    setQ('');
    setCollection('');
    setLine('');
    setVisibility('all');
    setFilterKey((key) => key + 1);
  };

  return (
    <>
      <PageHead title="Manage products">
        <Link className="adm-btn adm-btn--primary adm-btn--sm" href="/admin/products/new/">
          + Add product
        </Link>
      </PageHead>

      <div className="adm-card adm-card--flush">
        <div className="adm-filters">
          <SearchInput key={filterKey} value={q} onChange={(value) => filter(() => setQ(value))} placeholder="Search by name or product code..." />
          <select className="adm-input adm-input--sm" aria-label="Collection" value={collection} onChange={(event) => filter(() => setCollection(event.target.value))}>
            <option value="">All collections</option>
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value="none">— No collection —</option>
          </select>
          <select className="adm-input adm-input--sm" aria-label="Product line" value={line} onChange={(event) => filter(() => setLine(event.target.value))}>
            <option value="">All lines</option>
            {PRODUCT_LINES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
            <option value="shared">Shared (both lines)</option>
          </select>
          <select className="adm-input adm-input--sm" aria-label="Visibility" value={visibility} onChange={(event) => filter(() => setVisibility(event.target.value))}>
            <option value="all">Visible &amp; hidden</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          {filtered && (
            <button type="button" className="adm-link" onClick={clearFilters}>
              ✕ Clear filters
            </button>
          )}
          <span className="adm-filters__count">
            {total} {total === 1 ? 'product' : 'products'}
          </span>
        </div>

        {error && <div className="adm-error" style={{ margin: 16 }}>{error}</div>}

        {rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Collection</th>
                  <th>Line</th>
                  <th>Visible</th>
                  <th>New product</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.image ? <img className="adm-thumb" src={mediaSrc(row.image)} alt="" loading="lazy" /> : <div className="adm-thumb adm-thumb--empty" />}</td>
                    <td className="adm-cell-title">
                      <Link href={`/admin/products/${row.id}/`}>{row.title}</Link>
                      <small>{row.subtitle}</small>
                      <small>
                        <code>/product/{row.slug}/</code>
                      </small>
                    </td>
                    <td className="adm-muted">{row.collectionName ?? '—'}</td>
                    <td>
                      {row.line ? (
                        <span className={`adm-badge ${LINE_BADGE[row.line]}`}>{lineLabel(row.line)}</span>
                      ) : (
                        <span className="adm-muted">Shared</span>
                      )}
                    </td>
                    <td>
                      <label className="adm-check">
                        <input type="checkbox" checked={row.isActive} onChange={() => toggle(row, 'isActive')} />
                        <span style={row.isActive ? undefined : { color: '#dc2626' }}>{row.isActive ? 'Visible' : 'Hidden'}</span>
                      </label>
                    </td>
                    <td>
                      <label className="adm-check">
                        <input type="checkbox" checked={row.isNew} onChange={() => toggle(row, 'isNew')} />
                        {row.isNew ? <span className="adm-badge adm-badge--green">New</span> : <span className="adm-muted">Regular</span>}
                      </label>
                    </td>
                    <td>
                      <div className="adm-acts">
                        <Link className="adm-act adm-act--edit" href={`/admin/products/${row.id}/`}>
                          Edit
                        </Link>
                        {row.isActive && (
                          <a className="adm-act adm-act--view" href={`/product/${encodeURIComponent(row.slug)}/`} target="_blank" rel="noopener" title="View on site">
                            👁
                          </a>
                        )}
                        <button type="button" className="adm-act adm-act--del" onClick={() => remove(row)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && rows.length === 0 && <Loading />}
        {!loading && rows.length === 0 && !error && (
          <Empty icon="🔊" text={filtered ? 'No products match your filters.' : 'No products yet.'}>
            {filtered ? (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            ) : (
              <Link href="/admin/products/new/">Add your first product →</Link>
            )}
          </Empty>
        )}

        <div ref={sentinel} />
        {rows.length > 0 && (
          <div className="adm-table-foot">
            {loading ? 'Loading more…' : hasMore ? `Loaded ${rows.length}/${total} — scroll down to see more` : `Showing all ${total} ${total === 1 ? 'product' : 'products'}.`}
          </div>
        )}
      </div>
    </>
  );
}
