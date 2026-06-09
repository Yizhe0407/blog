import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yizhe.dev",
      },
      {
        protocol: "https",
        hostname: "img.yizhe.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        source: "/lodding.webm",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/frames/:path*",
        destination: "https://img.yizhe.dev/frames/:path*",
      },
      // sequence frames: local public/sequences/ in dev; R2 in production
      {
        source: "/sequences/:path*",
        destination: "https://img.yizhe.dev/sequences/:path*",
      },
    ]
  },
}

export default nextConfig
