import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/api/v1/:path*",
      },
      {
        source: "/docs",
        destination: "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/docs",
      },
      {
        source: "/openapi.json",
        destination: "http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com/openapi.json",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: http://pocketpilot-alb-prod-245261752.us-east-1.elb.amazonaws.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
