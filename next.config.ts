import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toISOString(),
  },
  sassOptions: {},
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/posts": ["./data/nfc.db"],
    "/api/timestamps": ["./data/nfc.db"],
  },
};

export default nextConfig;
