import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
  webpack: (config) => {
    // canvas is required by some pdf libs but not available in the edge runtime
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
  // Suppress noisy warnings from large AI / pdf packages
  serverExternalPackages: ["pdf-parse", "canvas"],
};

export default nextConfig;
