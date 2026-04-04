import { NextRequest, NextResponse } from "next/server";
import { forwardRumRequest, runtime } from "../route";

export { runtime };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const monitorIdFromPath =
    path.length >= 2 && path[0] === "appmonitors" ? path[1] : undefined;

  return forwardRumRequest(request, monitorIdFromPath);
}

export async function GET() {
  return NextResponse.json(
    { message: "RUM proxy expects POST requests." },
    { status: 405 },
  );
}

