import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The application still enforces 2 MB; this only leaves room for multipart metadata.
    serverActions: { bodySizeLimit: "2.25mb" },
  },
};

export default nextConfig;
