import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Crumbs from '@/components/Crumbs';
import PostCard from '@/components/PostCard';
import Rail from '@/components/Rail';
import { getPost, getPosts } from '@/lib/content';
import { excerpt, fmtDate, mediaUrl, rich } from '@/lib/format';
import { pageMeta } from '@/lib/meta';

// News posts live at the site root (/<post-slug>/), exactly like on the old WordPress site.

type Props = { params: Promise<{ slug: string }> };

const decode = (slug: string) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(decode((await params).slug));
  if (!post) return {};
  return pageMeta({
    title: post.title,
    description: excerpt(post.excerpt || post.content, 170),
    path: `/${encodeURIComponent(post.slug)}/`,
    image: post.image,
    type: 'article',
  });
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(decode((await params).slug));
  if (!post) notFound();
  const others = (await getPosts()).filter((p) => p.slug !== post.slug);

  return (
    <>
      <Crumbs trail={[{ label: 'News', href: '/news/' }, { label: excerpt(post.title, 60) }]} />

      <article className="article">
        {post.image && (
          <div className="article__hero">
            <Image src={mediaUrl(post.image)} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" />
          </div>
        )}
        <header className="article__head">
          <div className="ncard__meta">
            <time dateTime={post.publishedAt.slice(0, 10)}>{fmtDate(post.publishedAt, true)}</time>
            <span className="label">News</span>
          </div>
          <h1 className="article__title">{post.title}</h1>
        </header>
        <div className="prose prose--article" dangerouslySetInnerHTML={{ __html: rich(post.content) }} />
        <p className="article__back">
          <Link className="link-arrow" href="/news/">
            <span aria-hidden="true">←</span> All news
          </Link>
        </p>
      </article>

      {others.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Latest news</h2>
          </div>
          <Rail news>
            {others.slice(0, 9).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </Rail>
        </section>
      )}
    </>
  );
}
