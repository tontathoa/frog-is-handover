import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Same URL shape as the WordPress site this replaces (/product/<slug>/).
  trailingSlash: true,
  poweredByHeader: false,
  // Keep the dev-mode badge away from the admin sidebar (bottom-left).
  devIndicators: { position: 'bottom-right' },
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
    ];
  },
};

export default nextConfig;
