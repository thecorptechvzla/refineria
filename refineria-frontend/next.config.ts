import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'gcfx9i-ip-200-8-201-247.tunnelmole.net',
    '0llmai-ip-200-8-201-247.tunnelmole.net',
    '192.168.0.109',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};

export default nextConfig;
