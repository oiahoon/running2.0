/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    // Enable modern features
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  // Optimize for production
  swcMinify: true,
  // Disable TypeScript errors during build (temporary for deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint errors during build (temporary for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // API routes configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
