/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/portfolio',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/dashboard/investments',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
