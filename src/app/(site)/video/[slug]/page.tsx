import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Crumbs from '@/components/Crumbs';
import VideoCard from '@/components/VideoCard';
import { getVideo, getVideos } from '@/lib/content';
import { mediaUrl, rich } from '@/lib/format';
import { pageMeta } from '@/lib/meta';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getVideos()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideo((await params).slug);
  if (!video) return {};
  return pageMeta({ title: video.title, path: `/video/${video.slug}/`, image: video.thumb });
}

export default async function VideoPage({ params }: Props) {
  const video = await getVideo((await params).slug);
  if (!video) notFound();
  const others = (await getVideos()).filter((v) => v.slug !== video.slug);

  return (
    <>
      <Crumbs trail={[{ label: 'Applications', href: '/applications/' }, { label: video.title }]} />

      <article className="section section--flush">
        <div className="player">
          {video.video ? (
            <video controls playsInline preload="metadata" poster={video.thumb ? mediaUrl(video.thumb) : undefined}>
              <source src={mediaUrl(video.video)} type="video/mp4" />
            </video>
          ) : video.embed ? (
            <iframe src={video.embed} title={video.title} allowFullScreen loading="lazy" />
          ) : (
            video.thumb && <img src={mediaUrl(video.thumb)} alt="" />
          )}
        </div>
        <header className="player__head">
          <p className="label">
            Application{video.duration && ` · ${video.duration}`}
          </p>
          <h1 className="article__title">{video.title}</h1>
          {video.description && <div className="prose" dangerouslySetInnerHTML={{ __html: rich(video.description) }} />}
        </header>
      </article>

      {others.length > 0 && (
        <section className="section section--flush" aria-label="More videos">
          <div className="vgrid">
            {others.map((v) => (
              <VideoCard
                key={v.slug}
                heading="h2"
                video={{ slug: v.slug, title: v.title, thumb: mediaUrl(v.thumb), duration: v.duration, src: mediaUrl(v.video) }}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
