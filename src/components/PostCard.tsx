import Image from 'next/image';
import Link from 'next/link';
import { excerpt, fmtDate, mediaUrl } from '@/lib/format';
import type { Post } from '@/lib/types';

export default function PostCard({ post, heading: Heading = 'h3' }: { post: Post; heading?: 'h2' | 'h3' }) {
  return (
    <Link className="ncard" href={`/${encodeURIComponent(post.slug)}/`}>
      <div className="ncard__media">
        {post.image && <Image src={mediaUrl(post.image)} alt="" fill sizes="(max-width: 640px) 85vw, (max-width: 1100px) 50vw, 33vw" />}
      </div>
      <div className="ncard__meta">
        <time dateTime={post.publishedAt.slice(0, 10)}>{fmtDate(post.publishedAt)}</time>
        <span className="label">News</span>
      </div>
      <Heading className="ncard__title">{post.title}</Heading>
      <p className="ncard__text">{excerpt(post.excerpt || post.content, 170)}</p>
    </Link>
  );
}
