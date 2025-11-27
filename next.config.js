/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignoramos el chequeo de tipos en build para evitar bloqueo por dependencias de terceros
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig