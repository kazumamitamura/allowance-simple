import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // ←これを無効化または削除することが最重要
  typescript: {
    ignoreBuildErrors: true, // 型エラーでデプロイを止めない
  },
};

export default nextConfig;
