/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverActions: {
    bodySizeLimit: '50mb',
  },
}

export default nextConfig
