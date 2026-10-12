import PostCard from '@/components/PostCard';
import { getPosts } from '@/lib/content';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({ title: 'News', description: 'Frog-is news, projects and case studies.', path: '/news/' });

export default async function NewsPage() {
  const posts = await getPosts();
  return (
    <>
      <div className="page-head">
        <h1 className="display">News</h1>
        <p className="page-head__lead">Projects, events and updates from Frog-is.</p>
      </div>

      <section className="section section--narrow">
        {posts.length > 0 ? (
          <div className="ngrid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} heading="h2" />
            ))}
          </div>
        ) : (
          <p className="empty">No news yet.</p>
        )}
      </section>
    </>
  );
}
