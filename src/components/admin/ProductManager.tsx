'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorText, type Paginated } from './api';
import { Empty, Loading, PageHead, SearchInput, mediaSrc } from './ui';

type Row = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image: string | null;
  collectionName: string | null;
  isActive: boolean;
  isNew: boolean;
};
type CollectionOption = { id: number; name: string };

const PER_FETCH = 30;

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
    [q, collection, visibility],
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
    if (!window.confirm(`Xóa sản phẩm "${row.title}"?\n\nThao tác không thể hoàn tác. Nếu chỉ muốn tạm ẩn, hãy bỏ chọn "Hiện".`)) return;
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
  const filtered = Boolean(q || collection || visibility !== 'all');
  const clearFilters = () => {
    setLoading(true);
    setQ('');
    setCollection('');
    setVisibility('all');
    setFilterKey((key) => key + 1);
  };

  return (
    <>
      <PageHead title="Quản lý sản phẩm">
        <Link className="adm-btn adm-btn--primary adm-btn--sm" href="/admin/products/new/">
          + Thêm sản phẩm
        </Link>
      </PageHead>

      <div className="adm-card adm-card--flush">
        <div className="adm-filters">
          <SearchInput key={filterKey} value={q} onChange={(value) => filter(() => setQ(value))} placeholder="Tìm theo tên, mã sản phẩm..." />
          <select className="adm-input adm-input--sm" aria-label="Danh mục" value={collection} onChange={(event) => filter(() => setCollection(event.target.value))}>
            <option value="">Tất cả danh mục</option>
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value="none">— Chưa có danh mục —</option>
          </select>
          <select className="adm-input adm-input--sm" aria-label="Hiển thị" value={visibility} onChange={(event) => filter(() => setVisibility(event.target.value))}>
            <option value="all">Hiện &amp; ẩn</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đang ẩn</option>
          </select>
          {filtered && (
            <button type="button" className="adm-link" onClick={clearFilters}>
              ✕ Xóa lọc
            </button>
          )}
          <span className="adm-filters__count">{total} sản phẩm</span>
        </div>

        {error && <div className="adm-error" style={{ margin: 16 }}>{error}</div>}

        {rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Hình</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Hiển thị</th>
                  <th>Sản phẩm mới</th>
                  <th>Thao tác</th>
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
                      <label className="adm-check">
                        <input type="checkbox" checked={row.isActive} onChange={() => toggle(row, 'isActive')} />
                        <span style={row.isActive ? undefined : { color: '#dc2626' }}>{row.isActive ? 'Hiện' : 'Ẩn'}</span>
                      </label>
                    </td>
                    <td>
                      <label className="adm-check">
                        <input type="checkbox" checked={row.isNew} onChange={() => toggle(row, 'isNew')} />
                        {row.isNew ? <span className="adm-badge adm-badge--green">Mới</span> : <span className="adm-muted">Thường</span>}
                      </label>
                    </td>
                    <td>
                      <div className="adm-acts">
                        <Link className="adm-act adm-act--edit" href={`/admin/products/${row.id}/`}>
                          Sửa
                        </Link>
                        {row.isActive && (
                          <a className="adm-act adm-act--view" href={`/product/${encodeURIComponent(row.slug)}/`} target="_blank" rel="noopener" title="Xem trên website">
                            👁
                          </a>
                        )}
                        <button type="button" className="adm-act adm-act--del" onClick={() => remove(row)}>
                          Xóa
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
          <Empty icon="🔊" text={filtered ? 'Không có sản phẩm nào khớp bộ lọc.' : 'Chưa có sản phẩm nào.'}>
            {filtered ? (
              <button type="button" onClick={clearFilters}>
                Xóa lọc
              </button>
            ) : (
              <Link href="/admin/products/new/">Thêm sản phẩm đầu tiên →</Link>
            )}
          </Empty>
        )}

        <div ref={sentinel} />
        {rows.length > 0 && (
          <div className="adm-table-foot">
            {loading ? 'Đang tải thêm…' : hasMore ? `Đã tải ${rows.length}/${total} — cuộn tiếp để xem thêm` : `Đã hiện hết ${total} sản phẩm.`}
          </div>
        )}
      </div>
    </>
  );
}
