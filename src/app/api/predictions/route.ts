import { NextRequest, NextResponse } from "next/server";
import { generatePrediction } from "@/lib/prediction-engine";
import {
  fetchTeamStats,
  fetchHeadToHead,
  fetchOdds,
  getDemoMatches,
} from "@/lib/football-api";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json(
      { error: "matchId parametresi gerekli" },
      { status: 400 }
    );
  }

  try {
    const allMatches = getDemoMatches();
    const match = allMatches.find((m: Match) => m.id === matchId);

    if (!match) {
      return NextResponse.json(
        { error: "Mac bulunamadi" },
        { status: 404 }
      );
    }

    const [homeStats, awayStats, h2h, odds] = await Promise.all([
      fetchTeamStats(match.homeTeam.id),
      fetchTeamStats(match.awayTeam.id),
      fetchHeadToHead(match.homeTeam.id, match.awayTeam.id),
      fetchOdds(matchId),
    ]);

    const matchOdds = odds ?? match.odds;
    const predictions = generatePrediction(
      homeStats,
      awayStats,
      h2h,
      match.homeTeam.name,
      matchOdds
    );

    const confidence =
      predictions.matchResult.confidence * 0.3 +
      predictions.totalGoals.confidence * 0.25 +
      predictions.btts.confidence * 0.15 +
      predictions.doubleChance.confidence * 0.15 +
      predictions.combinedTip.confidence * 0.15;

    return NextResponse.json({
      prediction: {
        matchId,
        match,
        homeTeamStats: homeStats,
        awayTeamStats: awayStats,
        headToHead: h2h,
        predictions,
        confidence: Math.round(confidence * 100) / 100,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Tahmin olusturulurken hata olustu" },
      { status: 500 }
    );
  }
}
