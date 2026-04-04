import type { NextConfig } from "next";
import { getEasternBuildTimestamp } from "./src/app/utils/date";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: getEasternBuildTimestamp(),
  },
  sassOptions: {},
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/posts": ["./data/nfc.db"],
    "/api/timestamps": ["./data/nfc.db"],
  },
};

export default nextConfig;
