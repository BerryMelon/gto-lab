import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gto-lab',
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
};

export default nextConfig;
