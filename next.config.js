/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' since we have API routes that require server-side processing
  serverExternalPackages: ['@libsql/client'],
  images: {
    domains: ['via.placeholder.com'], // Specify allowed image domains
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig