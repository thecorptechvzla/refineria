import type { NextConfig } from "next";

const NEXT_PUBLIC_API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : 'https://refineria-backend.vercel.app';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.138', '192.168.0.107', 'https://refineria-backend.vercel.app'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
