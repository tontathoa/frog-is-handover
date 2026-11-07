import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Same URL shape as the WordPress site this replaces (/product/<slug>/).
  trailingSlash: true,
  poweredByHeader: false,
  // Keep the dev-mode badge away from the admin sidebar (bottom-left).
  devIndicators: { position: 'bottom-right' },
  images: {
    // AVIF where the browser takes it (about a third smaller than WebP), WebP otherwise.
    formats: ['image/avif', 'image/webp'],
    // Default list without 3840: a 4K-wide copy weighs 500-750 KB and no layout needs it.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Uploads get a new file name when replaced, so optimized copies can be kept for a month.
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      // WordPress search URL (/?s=query)
      { source: '/', has: [{ type: 'query', key: 's' }], destination: '/search/', permanent: false },
      // retired WooCommerce / old pages
      ...['shop', 'cart', 'order', 'account'].map((page) => ({ source: `/${page}`, destination: '/products/', permanent: true })),
      // WordPress paged collection lists (/collection/<slug>/page/<n>/): the new list is one page
      { source: '/collection/:slug/page/:n', destination: '/collection/:slug/', permanent: true },
      { source: '/download', destination: '/brochure/', permanent: true },
      { source: '/downloads', destination: '/brochure/', permanent: true },
      { source: '/order-form', destination: '/contact/', permanent: true },
      // renamed products (FI-CC12 / FI-CC10 are really the FI-CB8 / FI-CB10)
      { source: '/product/fi-cc12', destination: '/product/fi-cb8/', permanent: true },
      { source: '/product/fi-cc10', destination: '/product/fi-cb10/', permanent: true },
      { source: '/product/fi-sub210', destination: '/product/fi-sub10u/', permanent: true },
      { source: '/product/fi-sub215', destination: '/product/fi-sub15u/', permanent: true },
      // WordPress left this bracket with its post id as slug
      { source: '/product/22827', destination: '/product/fs-bracket1/', permanent: true },
    ];
  },
};

export default nextConfig;
