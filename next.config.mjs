/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignoramos el chequeo de tipos en build para evitar bloqueo por dependencias de terceros
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: 'loose', // Fix para ERR_REQUIRE_ESM con Stack Auth
  },
}

export default nextConfig;