import Link from 'next/link';
import { getDownloads } from '@/lib/content';
import { fileSizeLabel, mediaUrl } from '@/lib/format';
import { fileSize } from '@/lib/media';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta({
  title: 'Download',
  description: 'Frog-is catalog, certificates and control software downloads.',
  path: '/brochure/',
});

export default async function DownloadsPage() {
  const downloads = await getDownloads();
  return (
    <>
      <div className="page-head">
        <h1 className="display">Download</h1>
        <p className="page-head__lead">Catalog, certificates and control software.</p>
      </div>

      <section className="section section--narrow">
        <div className="dgrid">
          {downloads.map((d) => {
            // Fall back to the original file on frog-is.com when it was not mirrored locally.
            const bytes = fileSize(d.file);
            const href = d.file && bytes !== null ? mediaUrl(d.file) : (d.remote ?? mediaUrl(d.file));
            const kind = ((d.file ?? d.remote ?? '').split('.').pop() ?? '').toUpperCase().slice(0, 4);
            const size = fileSizeLabel(bytes);
            return (
              <a key={d.id} className="dcard" href={href || '#'} target="_blank" rel="noopener">
                <div className="dcard__media">{d.image && <img src={mediaUrl(d.image)} alt="" loading="lazy" />}</div>
                <div className="dcard__body">
                  <span className="label">
                    {kind}
                    {size && ` · ${size}`}
                  </span>
                  <h2 className="dcard__title">{d.title}</h2>
                  <span className="btn btn--dark">Download</span>
                </div>
              </a>
            );
          })}
        </div>
        <p className="note">
          Looking for a data sheet or manual? You will find it on each <Link href="/products/">product page</Link>.
        </p>
      </section>
    </>
  );
}
