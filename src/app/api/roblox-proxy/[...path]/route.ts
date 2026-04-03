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

    const response = await fetch(proxiedUrl, {
      method: "GET",
    });

    const body = await response.json();
    const imageUrl = body.data?.[0]?.imageUrl ?? "";

    return new NextResponse(imageUrl, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Roblox proxy error:", error);
    return new NextResponse(String(error), { status: 500 });
  }
}
