import { NextResponse } from "next/server";
import { fetchLiveMatches } from "@/lib/football-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await fetchLiveMatches();
    return NextResponse.json({ matches, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: "Canli maclar yuklenirken hata olustu" },
      { status: 500 }
    );
  }
}
