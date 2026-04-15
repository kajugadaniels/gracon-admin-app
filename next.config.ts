import path from "node:path";

const nextConfig = {
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  turbopack: {
    root: path.resolve(__dirname),
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
