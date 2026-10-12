'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, errorText } from './api';
import { Loading, PageHead, dateVN } from './ui';

type Stats = {
  counts: { collections: number; products: number; posts: number; unreadMessages: number; messages: number; subscribers: number };
  latestProducts: { id: number; title: string; subtitle: string; isActive: boolean; updatedAt: string }[];
  latestPosts: { id: number; title: string; isPublished: boolean; publishedAt: string }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Stats>('stats')
      .then(setStats)
      .catch((failure) => setError(errorText(failure)));
  }, []);

  if (error) return <div className="adm-error">{error}</div>;
  if (!stats) return <Loading />;

  const cards = [
    { label: 'Danh mục', value: stats.counts.collections, icon: '🗂', tint: '#eff6ff', href: '/admin/collections/' },
    { label: 'Sản phẩm', value: stats.counts.products, icon: '🔊', tint: '#ecfdf5', href: '/admin/products/' },
    { label: 'Bài viết', value: stats.counts.posts, icon: '📝', tint: '#fef9c3', href: '/admin/posts/' },
    { label: `Tin nhắn (${stats.counts.unreadMessages} chưa đọc)`, value: stats.counts.messages, icon: '✉️', tint: '#fdf2f8', href: '/admin/messages/' },
  ];

  return (
    <>
      <PageHead title="Tổng quan" sub="Nội dung đang có trên website Frog-is" />

      <div className="adm-stats">
        {cards.map((card) => (
          <Link key={card.href} className="adm-stat" href={card.href}>
            <div className="adm-stat__icon" style={{ background: card.tint }} aria-hidden="true">
              {card.icon}
            </div>
            <div>
              <div className="adm-stat__value">{card.value}</div>
              <div className="adm-stat__label">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="adm-cols">
        <div className="adm-card">
          <div className="adm-card__header">
            <h2 className="adm-card__title">Sản phẩm cập nhật gần đây</h2>
            <Link className="adm-link" href="/admin/products/">
              Xem tất cả →
            </Link>
          </div>
          <ul className="adm-list">
            {stats.latestProducts.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}/`}>
                  <strong>{product.title}</strong> <span className="adm-muted">{product.subtitle}</span>
                </Link>
                <span className={`adm-badge ${product.isActive ? 'adm-badge--green' : 'adm-badge--gray'}`}>{product.isActive ? 'Hiện' : 'Ẩn'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-card">
          <div className="adm-card__header">
            <h2 className="adm-card__title">Bài viết mới nhất</h2>
            <Link className="adm-link" href="/admin/posts/">
              Xem tất cả →
            </Link>
          </div>
          <ul className="adm-list">
            {stats.latestPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${post.id}/`}>{post.title}</Link>
                <span className="adm-muted" style={{ whiteSpace: 'nowrap' }}>
                  {post.isPublished ? dateVN(post.publishedAt) : 'Nháp'}
                </span>
              </li>
            ))}
            {stats.latestPosts.length === 0 && <li className="adm-muted">Chưa có bài viết nào.</li>}
          </ul>
        </div>
      </div>

      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-card__header">
          <h2 className="adm-card__title">⚡ Thao tác nhanh</h2>
        </div>
        <div className="adm-quick">
          <Link href="/admin/products/new/">
            <span aria-hidden="true">➕</span> Thêm sản phẩm
          </Link>
          <Link href="/admin/posts/new/">
            <span aria-hidden="true">✍️</span> Viết bài mới
          </Link>
          <Link href="/admin/downloads/">
            <span aria-hidden="true">📁</span> Tài liệu tải về
          </Link>
          <Link href="/admin/settings/">
            <span aria-hidden="true">⚙️</span> Cài đặt website
          </Link>
        </div>
      </div>
    </>
  );
}
