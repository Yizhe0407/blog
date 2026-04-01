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
  async rewrites() {
    return [
      {
        source: "/frames/:path*",
        destination: "https://img.yizhe.dev/frames/:path*",
      },
    ]
  },
}

export default nextConfig
