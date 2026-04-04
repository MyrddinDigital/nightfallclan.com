import { NextRequest, NextResponse } from "next/server";
import {
  RUMClient,
  PutRumEventsCommand,
  type PutRumEventsCommandInput,
} from "@aws-sdk/client-rum";

export const runtime = "nodejs";

const rumRegion =
  process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_REGION ??
  process.env.AWS_REGION ??
  "us-east-1";

const rumClient = new RUMClient({ region: rumRegion });
const fallbackMonitorId =
  process.env.NEXT_PUBLIC_CLOUDWATCH_RUM_APP_MONITOR_ID ?? "";

type RumProxyPayload = Omit<PutRumEventsCommandInput, "Id"> & {
  Id?: string;
};

function isPutRumEventsPayload(
  payload: unknown,
): payload is RumProxyPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const maybePayload = payload as Partial<RumProxyPayload>;
  return Boolean(
    maybePayload.AppMonitorDetails &&
      maybePayload.UserDetails &&
      maybePayload.BatchId &&
      Array.isArray(maybePayload.RumEvents),
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!isPutRumEventsPayload(payload)) {
      return NextResponse.json(
        { message: "Invalid RUM payload." },
        { status: 400 },
      );
    }

    const monitorId = payload.Id ?? payload.AppMonitorDetails?.id ?? fallbackMonitorId;
    if (!monitorId) {
      return NextResponse.json(
        { message: "Missing app monitor ID for RUM proxy." },
        { status: 400 },
      );
    }
    if (!payload.RumEvents || payload.RumEvents.length === 0) {
      return NextResponse.json(
        { message: "Missing RUM events." },
        { status: 400 },
      );
    }

    const commandInput: PutRumEventsCommandInput = {
      Id: monitorId,
      BatchId: payload.BatchId,
      AppMonitorDetails: payload.AppMonitorDetails,
      UserDetails: payload.UserDetails,
      RumEvents: payload.RumEvents.map((event) => ({
        ...event,
        timestamp:
          event.timestamp instanceof Date
            ? event.timestamp
            : new Date(event.timestamp ?? Date.now()),
      })),
      Alias: payload.Alias,
    };

    const result = await rumClient.send(new PutRumEventsCommand(commandInput));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("RUM proxy error:", error);
    return NextResponse.json(
      { message: "Failed to forward RUM events." },
      { status: 500 },
    );
  }
}
