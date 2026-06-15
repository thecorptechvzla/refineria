import type { NextConfig } from "next";

const NEXT_PUBLIC_API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000' // O tu IP local si pruebas desde el teléfono: 'http://192.168.0.106:4000'
  : 'https://refineria-backend.vercel.app';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.106', 'https://refineria-backend.vercel.app' // Mantenlo si desarrollas desde red local
  ],
  async rewrites() {
    return [
      {
        // Cada vez que NextJS vea una ruta que empiece con /api/...
        source: '/api/:path*',
        // La redirigirá de forma transparente al backend correcto sin levantar sospechas de CORS
        destination: `${NEXT_PUBLIC_API_URL}/:path*`, 
      },
    ];
  },
};

export default nextConfig;
