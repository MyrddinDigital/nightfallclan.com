import type { NextConfig } from "next";
import { getEasternBuildTimestamp } from "./src/app/utils/date";

const rumRegion = process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_REGION ?? "us-east-1";
const csp = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.rum." +
    rumRegion +
    ".amazonaws.com",
  "connect-src 'self' https://client.rum." +
    rumRegion +
    ".amazonaws.com https://dataplane.rum." +
    rumRegion +
    ".amazonaws.com https://cognito-identity." +
    rumRegion +
    ".amazonaws.com https://sts." +
    rumRegion +
    ".amazonaws.com",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' data: https:",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: getEasternBuildTimestamp(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
  sassOptions: {},
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/posts": ["./data/nfc.db"],
    "/api/timestamps": ["./data/nfc.db"],
  },
};

export default nextConfig;
