/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Railway — binds to 0.0.0.0 so the container is reachable
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  images: {
    domains: ["images.unsplash.com", "unsplash.com", "lh3.googleusercontent.com"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
