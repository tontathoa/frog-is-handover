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
      { source: '/download', destination: '/brochure/', permanent: true },
      { source: '/downloads', destination: '/brochure/', permanent: true },
      { source: '/order-form', destination: '/contact/', permanent: true },
    ];
  },
};

export default nextConfig;
