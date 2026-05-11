import { NextResponse } from "next/server";
import { fetchTodayMatches } from "@/lib/football-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await fetchTodayMatches();
    return NextResponse.json({ matches, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: "Maclar yuklenirken hata olustu" },
      { status: 500 }
    );
  }
}
