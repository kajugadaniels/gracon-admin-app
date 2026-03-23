// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unpkg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;