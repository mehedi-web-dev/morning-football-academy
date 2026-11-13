import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      
    ],
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/players",
        destination: "/squad",
        permanent: true,
      },
      {
        source: "/players/:slug*",
        destination: "/squad/:slug*",
        permanent: true,
      },
      {
        source: "/fixtures",
        destination: "/matches",
        permanent: true,
      },
      {
        source: "/fixtures/:id*",
        destination: "/matches/:id*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
