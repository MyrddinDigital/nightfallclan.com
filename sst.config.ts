/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "nightfallclan-com",
      removal: input.stage === "prod" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const wallDomain = "wall.nightfallclan.com";
    const apexDomain = "nightfallclan.com";
    const wallDestination = "https://nightfallclan.com/wall";
    const rumMonitorName = `nightfallclan-com-${$app.stage}`;
    const awsRegion = aws.getRegionOutput();

    const apexHostedZone = new aws.route53.Zone("NightfallClanHostedZone", {
      name: apexDomain,
    });

    const wallRedirect = new sst.aws.Router("WallSubdomainRedirect", {
      domain: {
        name: wallDomain,
        dns: sst.aws.dns({
          zone: apexHostedZone.zoneId,
        }),
      },
      edge: {
        viewerRequest: {
          injection: `
            const headers = event.request && event.request.headers ? event.request.headers : {};
            const hostHeader = headers.host;
            const host = hostHeader && hostHeader.value ? hostHeader.value : "";
            if (host === "${wallDomain}") {
              const requestPath = event.request && event.request.uri ? event.request.uri : "/";
              const suffix = requestPath === "/" ? "" : requestPath;
              return {
                statusCode: 308,
                statusDescription: "Permanent Redirect",
                headers: {
                  location: { value: "${wallDestination}" + suffix }
                }
              };
            }
          `,
        },
      },
    });
    wallRedirect.route("/", wallDestination);

    const appRumMonitor = new aws.rum.AppMonitor("NFCNextAppRumMonitor", {
      name: rumMonitorName,
      domain: apexDomain,
      cwLogEnabled: false,
      appMonitorConfiguration: {
        sessionSampleRate: 1,
      },
    });

    new sst.aws.Nextjs("NFCNextApp", {
      domain: {
        name: apexDomain,
        dns: sst.aws.dns({
          zone: apexHostedZone.zoneId,
        }),
        redirects: ["www.nightfallclan.com"],
      },
      environment: {
        NEXT_PUBLIC_CLOUDWATCH_RUM_APP_MONITOR_ID: appRumMonitor.appMonitorId,
        NEXT_PUBLIC_CLOUDWATCH_RUM_APP_MONITOR_NAME: appRumMonitor.name,
        NEXT_PUBLIC_CLOUDWATCH_RUM_REGION: awsRegion.region,
      },
      permissions: [
        {
          actions: ["rum:PutRumEvents"],
          resources: [appRumMonitor.arn],
        },
      ],
    });

    return {
      hostedZoneId: apexHostedZone.zoneId,
      hostedZoneName: apexHostedZone.name,
      nameServers: apexHostedZone.nameServers,
      rumAppMonitorName: appRumMonitor.name,
      rumAppMonitorId: appRumMonitor.appMonitorId,
      rumAppMonitorArn: appRumMonitor.arn,
    };
  },
});
