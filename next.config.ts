import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [], // Agrega tus dominios permitidos si usas <Image />
  },
  experimental: {
    serverActions: true, // ajusta según Next.js versión
  },
};

export default nextConfig;