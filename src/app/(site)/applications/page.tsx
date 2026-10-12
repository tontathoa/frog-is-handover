import PostCard from '@/components/PostCard';
import VideoCard from '@/components/VideoCard';
import { getPosts, getVideos } from '@/lib/content';
import { mediaUrl } from '@/lib/format';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({
  title: 'Applications',
  description: 'Frog-is audio systems at work: venues, restaurants, schools, stadiums and live events.',
  path: '/applications/',
});

export default async function ApplicationsPage() {
  const [videos, posts] = await Promise.all([getVideos(), getPosts()]);
  return (
    <>
      <div className="page-head">
        <h1 className="display">Applications</h1>
        <p className="page-head__lead">Frog-is systems at work — from restaurants and lounges to schools, venues and stadiums.</p>
      </div>

      {videos.length > 0 && (
        <section className="section section--flush" aria-label="Videos">
          <div className="vgrid vgrid--large">
            {videos.map((v) => (
              <VideoCard
                key={v.slug}
                heading="h2"
                video={{ slug: v.slug, title: v.title, thumb: mediaUrl(v.thumb), duration: v.duration, src: mediaUrl(v.video) }}
              />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <>
          <section className="band band--dark">
            <h2 className="band__title">Projects &amp; case studies</h2>
          </section>

          <section className="section section--narrow">
            <div className="ngrid">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
