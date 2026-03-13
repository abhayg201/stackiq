import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TS checked separately via `tsc --noEmit` — Next.js build worker crashes on Windows
  },
};

export default nextConfig;
