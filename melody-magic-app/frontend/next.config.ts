import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Removed deprecated turbo setting
  },
  // Ensure proper module resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    }
    return config
  },
}

export default nextConfig
