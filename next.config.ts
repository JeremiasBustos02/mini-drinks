import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The application still enforces 2 MB; this only leaves room for multipart metadata.
    serverActions: { bodySizeLimit: "2.25mb" },
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
