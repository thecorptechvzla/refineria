import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.138', '192.168.0.110', 'https://refineria-backend.vercel.app'
  ],
};

export default nextConfig;
