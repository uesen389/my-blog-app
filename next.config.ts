import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/my-blog-app',
  assetPrefix: '/my-blog-app',
};

export default nextConfig;
