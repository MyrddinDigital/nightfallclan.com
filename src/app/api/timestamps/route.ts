import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filterBanned = params.get("filterBanned") === "true";
  const db = getDb();

  const query = filterBanned
    ? "SELECT created_ms FROM timestamps WHERE is_banned = 0 ORDER BY created_ms"
    : "SELECT created_ms FROM timestamps ORDER BY created_ms";

  const rows = db.prepare(query).all() as { created_ms: number }[];
  const timestamps = rows.map((r) => r.created_ms);

  return NextResponse.json(timestamps);
}
