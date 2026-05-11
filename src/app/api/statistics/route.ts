import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = {
    totalPredictions: 1247,
    correctPredictions: 823,
    accuracy: 65.9,
    todayPredictions: 12,
    todayCorrect: 8,
    todayAccuracy: 66.7,
    streaks: {
      currentWin: 4,
      bestWin: 11,
    },
    byMarket: {
      matchResult: { total: 1247, correct: 756, accuracy: 60.6 },
      over25: { total: 1102, correct: 738, accuracy: 67.0 },
      btts: { total: 980, correct: 672, accuracy: 68.6 },
      doubleChance: { total: 1180, correct: 905, accuracy: 76.7 },
    },
    dailyStats: generateDailyStats(),
    leagueAccuracy: [
      { league: "Super Lig", accuracy: 68.2, predictions: 320 },
      { league: "Premier League", accuracy: 64.5, predictions: 280 },
      { league: "La Liga", accuracy: 66.8, predictions: 250 },
      { league: "Bundesliga", accuracy: 63.1, predictions: 200 },
      { league: "Serie A", accuracy: 65.4, predictions: 197 },
    ],
  };

  return NextResponse.json({ stats });
}

function generateDailyStats() {
  const stats = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const total = 8 + Math.floor(Math.random() * 8);
    const correct = Math.floor(total * (0.55 + Math.random() * 0.2));
    stats.push({
      date: date.toISOString().split("T")[0],
      totalPredictions: total,
      correctPredictions: correct,
      accuracy: Math.round((correct / total) * 1000) / 10,
    });
  }
  return stats;
}
