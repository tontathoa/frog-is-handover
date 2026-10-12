import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/config/site';
import { getAbout } from '@/lib/content';
import { mediaUrl, rich } from '@/lib/format';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({ title: 'About us', description: site.description, path: '/about-us/' });

export default async function AboutPage() {
  const { sections } = await getAbout();
  const intro = sections.find((s) => s.layout === 'full' && s.html);
  const wide = sections.find((s) => s.layout === 'full' && !s.html && s.image);
  const rows = sections.filter((s) => s !== intro && s !== wide);

  return (
    <>
      <div className="page-head">
        <h1 className="display">About us</h1>
      </div>

      {intro && (
        <section className="statement statement--left">
          {intro.title && <p className="label">{intro.title}</p>}
          <div className="statement__body" dangerouslySetInnerHTML={{ __html: rich(intro.html) }} />
        </section>
      )}

      {wide?.image && (
        <section className="section section--flush">
          <div className="banner banner--plain">
            <Image src={mediaUrl(wide.image)} alt="" fill sizes="100vw" />
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <section className="section section--flush">
          <div className="story">
            {rows.map((row, i) => (
              <div key={i} className={`story__row story__row--${row.layout}`}>
                <div className="story__media">{row.image && <img src={mediaUrl(row.image)} alt="" loading="lazy" />}</div>
                <div className="story__text">
                  {row.title && <h2 className="story__title">{row.title}</h2>}
                  <div className="prose" dangerouslySetInnerHTML={{ __html: rich(row.html) }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section section--flush">
        <div className="cta">
          <h2 className="cta__title">Discover our products</h2>
          <p className="cta__text">
            Speakers, subwoofers, amplifiers, mixers, microphones and all the accessories necessary to provide high quality sound.
          </p>
          <Link className="btn btn--light btn--wide" href="/products/">
            Browse products
          </Link>
        </div>
      </section>
    </>
  );
}
