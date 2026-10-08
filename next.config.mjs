/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Set the limit according to your needs (e.g., 5mb, 10mb, or 20mb)
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'btmejlttwfxuylumweso.supabase.co',
      },
    ],
  },
};

export default nextConfig;