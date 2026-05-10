import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["neuroads.com.br", "*.neuroads.com.br"],
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "neuroads.com.br" }],
        destination: "https://www.neuroads.com.br/:path*",
        permanent: true,
      },
    ];
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
