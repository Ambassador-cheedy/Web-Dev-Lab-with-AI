import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Placeholder editorial photography. Replace with Obioma's own imagery (see public/images/README.md).
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
