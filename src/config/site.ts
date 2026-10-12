/**
 * Hand-edited site settings: name, tagline and navigation.
 * Editable content (products, posts, ...) lives in the database and is managed in /admin.
 */
export const site = {
  name: 'Frog-is',
  tagline: 'Architects Favorite Audio Brand',
  description:
    'Frog-is is an innovative pro-audio company. With our R&D in Florence, we offer the best in technology from Europe and Asia: speakers, subwoofers, amplifiers, mixers and microphones.',

  /** Public origin, used for canonical URLs, Open Graph and the sitemap. Set SITE_URL per environment. */
  origin: (process.env.SITE_URL || 'https://www.frog-is.com').replace(/\/+$/, ''),

  /** SITE_NOINDEX=1 keeps a demo / staging copy out of search engines. */
  noindex: process.env.SITE_NOINDEX === '1',

  nav: [
    { label: 'Products', path: 'products/', mega: true },
    { label: 'Applications', path: 'applications/' },
    { label: 'News', path: 'news/' },
    { label: 'Download', path: 'brochure/' },
    { label: 'About us', path: 'about-us/' },
    { label: 'Contact', path: 'contact/' },
  ] as { label: string; path: string; mega?: boolean }[],
};
