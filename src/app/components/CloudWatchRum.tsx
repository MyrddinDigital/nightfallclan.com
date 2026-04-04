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
    const appVersion = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? "0.0.0";

    if (!appMonitorId || !region) {
      return;
    }

    const config: AwsRumConfig = {
      allowCookies: true,
      enableXRay: false,
      sessionSampleRate: 1,
      telemetries: ["errors", "performance", "http"],
      signing: false,
    };

    try {
      rumClient = new AwsRum(appMonitorId, appVersion, region, config);
    } catch {
      // Avoid impacting app runtime if monitoring initialization fails.
    }
  }, []);

  return null;
}
