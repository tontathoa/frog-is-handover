import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import PostCard from '@/components/PostCard';
import ProductCard from '@/components/ProductCard';
import Rail from '@/components/Rail';
import VideoCard from '@/components/VideoCard';
import { site } from '@/config/site';
import { getAbout, getCollections, getContactInfo, getNewProducts, getPosts, getProducts, getSlides, getVideos } from '@/lib/content';
import { mediaUrl, plain } from '@/lib/format';
import { inLine, lineHref, PRODUCT_LINES } from '@/lib/lines';
import { productShot } from '@/lib/media';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({ title: `${site.name} — ${site.tagline}`, absoluteTitle: true, path: '/' });

export default async function HomePage() {
  const [slides, fresh, collections, about, videos, posts, info, products] = await Promise.all([
    getSlides(),
    getNewProducts(),
    getCollections(),
    getAbout(),
    getVideos(),
    getPosts(),
    getContactInfo(),
    getProducts(),
  ]);

  const shortName = new Map(collections.map((c) => [c.slug, c.short]));
  // both lines show the shared products (accessories), so the counts match what the line page lists
  const lines = PRODUCT_LINES.map((item) => {
    const items = products.filter((p) => inLine(p.line, item.value));
    return { ...item, count: items.length, collections: collections.filter((c) => items.some((p) => p.collection === c.slug)).map((c) => c.short) };
  });
  const featured = fresh.slice(0, 4);
  const more = fresh.slice(4);
  const intro = about.sections.find((s) => s.layout === 'full' && s.html)?.html ?? '';
  const statement = [...intro.matchAll(/<p>(.*?)<\/p>/gs)].map((m) => plain(m[1])).slice(0, 2);
  const banner = slides[1]?.image ?? slides[0]?.image;

  return (
    <>
      <HeroSlider
        slides={slides.map((slide) => ({
          image: mediaUrl(slide.image),
          title: slide.title,
          text: slide.text,
          cta: slide.cta,
          href: slide.href,
        }))}
      />

      <section className="band">
        <h2 className="band__title">Two product lines, one consistent sound</h2>
      </section>

      <section className="section section--flush" aria-label="Product lines">
        <div className="lines">
          {lines.map((item, i) => (
            <Link key={item.value} className="line" href={lineHref(item.value)}>
              <Image src={item.photo} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" priority={i === 0} />
              <span className="line__credit">Photo: {item.credit} / Unsplash</span>
              <span className="line__content">
                <span className="line__eyebrow">Product line {String(i + 1).padStart(2, '0')}</span>
                <h3 className="line__title">{item.label}</h3>
                <p className="line__tagline">{item.tagline}</p>
                <p className="line__text">{item.text}</p>
                <p className="line__meta">
                  {item.count} products · {item.collections.join(' · ')}
                </p>
                <span className="btn btn--light btn--wide">Explore {item.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <>
          <section className="band">
            <h2 className="band__title">Keep up with our new products</h2>
          </section>

          <section className="section section--flush" aria-label="New products">
            <div className="tiles">
              {featured.map((p) => (
                <Link key={p.slug} className="tile" href={`/product/${encodeURIComponent(p.slug)}/`}>
                  <div className="tile__media">
                    {p.images[0] && <Image src={productShot(p.images[0])} alt={p.title} fill sizes="(max-width: 640px) 100vw, 50vw" />}
                  </div>
                  <div className="tile__content">
                    <h3 className="tile__title">{p.title}</h3>
                    <p className="tile__text">{p.subtitle}</p>
                    <span className="btn btn--dark btn--wide">Find out more!</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {more.length > 0 && (
        <section className="section" aria-label="More new products">
          <Rail>
            {more.map((p) => (
              <ProductCard key={p.slug} product={p} label={shortName.get(p.collection ?? '')} compact />
            ))}
          </Rail>
        </section>
      )}

      <section className="band band--dark">
        <h2 className="band__title">Discover our collections</h2>
      </section>

      <section className="section section--flush" aria-label="Collections">
        <div className="cgrid">
          {collections.map((c) => (
            <Link key={c.slug} className="ctile" href={`/collection/${c.slug}/`}>
              <span className="ctile__icon">
                {c.icon && <img src={mediaUrl(c.icon)} alt="" loading="lazy" width={190} height={180} />}
                {c.iconHover && <img className="is-hover" src={mediaUrl(c.iconHover)} alt="" loading="lazy" width={190} height={180} />}
              </span>
              <span className="ctile__name">{c.name}</span>
              <span className="ctile__meta">Collection · {c.productCount} products</span>
            </Link>
          ))}
        </div>
      </section>

      {statement.length > 0 && (
        <section className="statement">
          {statement.map((text, i) => (
            <p key={i} className={i ? 'statement__small' : undefined}>
              {text}
            </p>
          ))}
          <Link className="btn btn--dark btn--wide" href="/about-us/">
            About Frog-is
          </Link>
        </section>
      )}

      {banner && (
        <section className="section section--flush">
          <Link className="banner" href="/applications/">
            <Image src={mediaUrl(banner)} alt="" fill sizes="100vw" />
            <div className="banner__content">
              <h2 className="hero__title">Applications</h2>
              <p className="hero__text">Restaurants, venues, schools, stadiums — Frog-is at work</p>
              <span className="btn btn--light btn--wide">Browse it!</span>
            </div>
          </Link>
        </section>
      )}

      {videos.length > 0 && (
        <section className="section section--flush" aria-label="Application videos">
          <div className="vgrid">
            {videos.map((v) => (
              <VideoCard
                key={v.slug}
                video={{ slug: v.slug, title: v.title, thumb: mediaUrl(v.thumb), duration: v.duration, src: mediaUrl(v.video) }}
              />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Latest news</h2>
            <Link className="link-arrow" href="/news/">
              All news <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Rail news>
            {posts.slice(0, 9).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </Rail>
        </section>
      )}

      <section className="section section--flush">
        <div className="cta">
          <h2 className="cta__title">Contact us</h2>
          <p className="cta__text">{info.intro || 'If you have any enquiry or need other information, feel free to contact us.'}</p>
          <Link className="btn btn--light btn--wide" href="/contact/">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
