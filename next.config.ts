import type { NextConfig } from "next";
import { getEasternBuildTimestamp } from "./src/app/utils/date";

const csp = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self'",
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
