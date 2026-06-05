import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
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
