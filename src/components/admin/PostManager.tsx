'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorText, type Paginated } from './api';
import { Empty, Loading, PageHead, Pagination, SearchInput, dateVN, mediaSrc } from './ui';

type Row = { id: number; slug: string; title: string; image: string | null; isPublished: boolean; publishedAt: string };

const PER_PAGE = 15;

export default function PostManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [filterKey, setFilterKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);

  const load = useCallback(() => {
    const id = (request.current += 1);
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    api
      .get<Paginated<Row>>(`posts?${params}`)
      .then((response) => {
        if (id !== request.current) return; // a newer request superseded this one
        setError('');
        setRows(response.data);
        setTotal(response.pagination.total);
        setPages(response.pagination.pages);
      })
      .catch((failure) => {
        if (id === request.current) setError(errorText(failure));
      })
      .finally(() => {
        if (id === request.current) setLoading(false);
      });
  }, [page, q, status]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (row: Row) => {
    try {
      // Only the flag is sent; the server leaves every other field as it is.
      await api.put(`posts/${row.id}`, { isPublished: !row.isPublished });
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, isPublished: !row.isPublished } : item)));
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Xóa bài viết "${row.title}"?\n\nThao tác không thể hoàn tác.`)) return;
    try {
      await api.del(`posts/${row.id}`);
      setLoading(true);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const filtered = Boolean(q || status);
  const clearFilters = () => {
    setLoading(true);
    setQ('');
    setStatus('');
    setPage(1);
    setFilterKey((key) => key + 1);
  };

  return (
    <>
      <PageHead title="Quản lý bài viết">
        <Link className="adm-btn adm-btn--primary adm-btn--sm" href="/admin/posts/new/">
          + Thêm bài viết
        </Link>
      </PageHead>

      <div className="adm-card adm-card--flush">
        <div className="adm-filters">
          <SearchInput
            key={filterKey}
            value={q}
            placeholder="Tìm theo tiêu đề..."
            onChange={(value) => {
              setLoading(true);
              setQ(value);
              setPage(1);
            }}
          />
          <select
            className="adm-input adm-input--sm"
            aria-label="Trạng thái"
            value={status}
            onChange={(event) => {
              setLoading(true);
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
          </select>
          {filtered && (
            <button type="button" className="adm-link" onClick={clearFilters}>
              ✕ Xóa lọc
            </button>
          )}
          <span className="adm-filters__count">{total} bài viết</span>
        </div>

        {error && <div className="adm-error" style={{ margin: 16 }}>{error}</div>}
        {loading && rows.length === 0 && <Loading />}

        {rows.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Hình</th>
                  <th>Tiêu đề</th>
                  <th>Ngày đăng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.image ? (
                        <img className="adm-thumb adm-thumb--wide" src={mediaSrc(row.image)} alt="" loading="lazy" />
                      ) : (
                        <div className="adm-thumb adm-thumb--wide adm-thumb--empty" aria-hidden="true">
                          📝
                        </div>
                      )}
                    </td>
                    <td className="adm-cell-title">
                      <Link href={`/admin/posts/${row.id}/`}>{row.title}</Link>
                      <small>
                        <code>/{row.slug}/</code>
                      </small>
                    </td>
                    <td className="adm-muted" style={{ whiteSpace: 'nowrap' }}>
                      {dateVN(row.publishedAt)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`adm-badge ${row.isPublished ? 'adm-badge--green' : 'adm-badge--gray'}`}
                        title={row.isPublished ? 'Bấm để chuyển về nháp' : 'Bấm để đăng bài'}
                        onClick={() => togglePublished(row)}
                      >
                        {row.isPublished ? '🟢 Đã đăng' : '⚪ Nháp'}
                      </button>
                    </td>
                    <td>
                      <div className="adm-acts">
                        <Link className="adm-act adm-act--edit" href={`/admin/posts/${row.id}/`}>
                          Sửa
                        </Link>
                        {row.isPublished && (
                          <a className="adm-act adm-act--view" href={`/${encodeURIComponent(row.slug)}/`} target="_blank" rel="noopener" title="Xem trên website">
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

        {!loading && rows.length === 0 && !error && (
          <Empty icon="📝" text={filtered ? 'Không có bài viết nào khớp bộ lọc.' : 'Chưa có bài viết nào.'}>
            {filtered ? (
              <button type="button" onClick={clearFilters}>
                Xóa lọc
              </button>
            ) : (
              <Link href="/admin/posts/new/">Tạo bài đầu tiên →</Link>
            )}
          </Empty>
        )}

        <Pagination
          page={page}
          pages={pages}
          onChange={(next) => {
            setLoading(true);
            setPage(next);
          }}
        />
      </div>
    </>
  );
}
