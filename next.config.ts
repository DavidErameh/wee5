import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
  experimental: {
    serverComponentsExternalPackages: ["@sentry/nextjs"],
  },
};

export default nextConfig;