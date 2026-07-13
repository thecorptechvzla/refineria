import type { NextConfig } from "next";
//necesito subir esto
const NEXT_PUBLIC_API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : 'https://api.controlmining.io';
  // : 'https://refineria-backend.vercel.app'; // habla bien LASHDASHJKD 

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.138', '192.168.9.108', 'https://api.controlmining.io'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path((?!blob/).*)',
        destination: `${NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
