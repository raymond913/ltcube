import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent WebGL context loss caused by the
  // double-mount/unmount cycle Strict Mode performs in development.
  reactStrictMode: false,
};

export default nextConfig;
