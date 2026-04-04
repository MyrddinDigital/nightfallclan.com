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

    let body = await response.json();

    let attempts = 1;
    const maxAttempts = 5;
    const statesToRetry = ["Pending", "InReview", "TemporarilyUnavailable"];

    // handle certain non-completed states by polling every 2s with a maximum of 10 attempts
    while (statesToRetry.includes(body?.data?.[0]?.state) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
      const retryResponse = await fetch(proxiedUrl, {
        method: "GET",
      });
      body = await retryResponse.json();
    }

    if (body?.data?.[0]?.state !== "Completed") {
      console.warn(body);
      return new NextResponse("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJMYXllcl8xIiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCA5MCA5MCI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGQ9Ik0wIDBoOTB2OTBIMHoiIHN0eWxlPSJmaWxsOiM2NTY2NjgiLz48ZyBpZD0idW5hcHByb3ZlZCIgc3R5bGU9Im9wYWNpdHk6LjMiPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiIGNsYXNzPSJzdDIiLz48cGF0aCBkPSJtMzggNDEuNyAxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk0zNi44IDIzLjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIgY2xhc3M9InN0MiIvPjwvZz48L2c+PC9zdmc+", { status: 502 });
    }

    const imageUrl = body.data?.[0]?.imageUrl;

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
