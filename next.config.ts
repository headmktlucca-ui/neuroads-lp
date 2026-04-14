import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["neuroads.com.br", "*.neuroads.com.br"],
    },
  },
};

export default nextConfig;
