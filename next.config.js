/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  trailingSlash: true, // 添加尾部斜杠
  swcMinify: false,
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
    domains: [],
  },
  // 移除API路由重写，因为静态导出不支持API路由
};

module.exports = nextConfig;
