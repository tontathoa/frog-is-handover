import type { Metadata } from 'next';
import { site } from '@/config/site';
import { mediaUrl } from './format';

type PageMeta = {
  title: string;
  description?: string;
  /** Canonical path, e.g. "/product/fi-sub12ip/". */
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Use the title as-is instead of appending the site name. */
  absoluteTitle?: boolean;
};

/** Longest title Google shows in full; a longer one is cut in the results. */
const TITLE_MAX = 65;

/** The <title>: with " | Frog-is" when it fits, without when it does not, shortened at a word as a last resort. */
function fitTitle(title: string, absolute?: boolean): string {
  const branded = absolute ? title : `${title} | ${site.name}`;
  if (branded.length <= TITLE_MAX) return branded;
  if (title.length <= TITLE_MAX) return title;
  const cut = title.slice(0, TITLE_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 30 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,—–-]+$/, '')}…`;
}

export function pageMeta({ title, description = site.description, path, image, type = 'website', noindex, absoluteTitle }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: { absolute: fitTitle(title, absoluteTitle) },
    description,
    alternates: { canonical: path },
    // Spread, not `robots: undefined`: an undefined key would still override the layout's value.
    ...(site.noindex ? { robots: { index: false, follow: false } } : noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      siteName: site.name,
      type,
      title: fullTitle,
      description,
      url: path,
      images: [image ? mediaUrl(image) : '/img/og.jpg'],
    },
    twitter: { card: 'summary_large_image' },
  };
}
