import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const proxiedPath = path.join("/");
    const { search } = new URL(request.url);
    const proxiedUrl = `https://thumbnails.roblox.com/v1/${proxiedPath}${search}`;

    let response = await fetch(proxiedUrl, {
      method: "GET",
    });

    let body = await response.json();

    let attempts = 1;
    const maxAttempts = 5;
    const statesToRetry = ["Pending", "InReview", "TemporarilyUnavailable"];

    // Retry while any requested thumbnail remains in a transient state.
    while (
      Array.isArray(body?.data) &&
      body.data.some((item: { state?: string }) => statesToRetry.includes(item?.state ?? "")) &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
      response = await fetch(proxiedUrl, {
        method: "GET",
      });
      body = await response.json();
    }

    return NextResponse.json(body, {
      status: response.status,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Roblox proxy error:", error);
    return new NextResponse(String(error), { status: 500 });
  }
}
