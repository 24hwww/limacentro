/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force server restart for postcss config changes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig;
