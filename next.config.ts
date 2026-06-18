import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Definitively copy the accented avatar image to a safe ASCII filename
try {
  const mediaPath = "C:\\Users\\claud\\.gemini\\antigravity-ide\\brain\\d9b70cb4-0e20-4f75-91bf-9ffecc217eb5\\media__1779859090069.png";
  const srcPath = path.join(process.cwd(), "public", "images", "Flávio Almeida.png");
  const destPath = path.join(process.cwd(), "public", "images", "flavio-almeida.png");
  
  if (fs.existsSync(mediaPath)) {
    fs.copyFileSync(mediaPath, destPath);
    console.log("Successfully copied new Flávio Almeida avatar from brain attachment to flavio-almeida.png!");
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log("Successfully copied existing Flávio Almeida avatar to flavio-almeida.png!");
  } else {
    console.warn("Source avatar images not found.");
  }
} catch (err) {
  console.error("Failed to copy Flávio Almeida avatar:", err);
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["neuroads.com.br", "*.neuroads.com.br"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
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
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
};

// Trigger dev server restart to reload corrected environment variables
// 2026-05-27T05:27:00
export default nextConfig;

