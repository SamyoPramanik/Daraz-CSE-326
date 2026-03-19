import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disables the /_next/image routing entirely
  },
};

export default nextConfig;
