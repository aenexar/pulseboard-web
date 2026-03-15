import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev", // R2 public subdomain
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com", // R2 storage endpoint
      },
    ],
  },
};

export default nextConfig;
