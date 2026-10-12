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

export function pageMeta({ title, description = site.description, path, image, type = 'website', noindex, absoluteTitle }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
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
