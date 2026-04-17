import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lock project root when parent directories contain other lockfiles (e.g. monorepo parent).
  turbopack: {
    root: process.cwd(),
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
