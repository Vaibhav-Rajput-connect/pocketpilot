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
};

export default nextConfig;
