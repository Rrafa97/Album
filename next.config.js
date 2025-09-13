/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  images: {
    unoptimized: true,
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/images/:path*',
        destination: '/api/images/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
