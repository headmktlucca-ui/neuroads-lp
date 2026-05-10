import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["neuroads.com.br", "*.neuroads.com.br"],
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Required for auth popup flows (Google/Firebase) to close correctly.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
