"use client";

import { useEffect } from "react";
import { AwsRum, type AwsRumConfig } from "aws-rum-web";

let rumClient: AwsRum | null = null;

export default function CloudWatchRum() {
  useEffect(() => {
    if (typeof window === "undefined" || rumClient) {
      return;
    }

    const appMonitorId = process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_APP_MONITOR_ID;
    const region = process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_REGION;
    const identityPoolId =
      process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_IDENTITY_POOL_ID;
    const appVersion = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? "0.0.0";

    if (!appMonitorId || !region || !identityPoolId) {
      return;
    }

    const config: AwsRumConfig = {
      sessionSampleRate: 1,
      endpoint: `https://dataplane.rum.${region}.amazonaws.com`,
      allowCookies: true,
      enableXRay: false,
      telemetries: ["errors", "performance", "http"],
      signing: true,
      identityPoolId,
    };

    try {
      rumClient = new AwsRum(appMonitorId, appVersion, region, config);
    } catch {
      // Avoid impacting app runtime if monitoring initialization fails.
      console.error("Failed to initialize CloudWatch RUM client");
    }
  }, []);

  return null;
}
