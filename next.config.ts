import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pagesがサブディレクトリ（リポジトリ名）で公開される場合は以下を有効化してください
  // basePath: '/my-blog-app',
};

export default nextConfig;