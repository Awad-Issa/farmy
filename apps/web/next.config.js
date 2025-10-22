const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@farmy/api', '@farmy/db', '@farmy/auth', '@farmy/validators', '@farmy/ui', '@farmy/utils'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  
  // Webpack configuration for native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules for server-side
      config.externals = config.externals || [];
      config.externals.push({
        'argon2': 'commonjs argon2',
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
      });
    }
    return config;
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/:locale(en|ar)',
        destination: '/:locale/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
