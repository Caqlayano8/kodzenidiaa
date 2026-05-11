"use client";

import { useEffect, useState, useRef } from "react";
import { Activity, RefreshCw, Wifi } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import type { Match, PredictionDetails } from "@/lib/types";
import { generatePrediction } from "@/lib/prediction-engine";
import { getDemoMatches } from "@/lib/football-api";

function getQuickPrediction(match: Match) {
  const homeStats = {
    played: 30, wins: 18, draws: 7, losses: 5, goalsFor: 52, goalsAgainst: 25,
    cleanSheets: 10, bttsCount: 16, over25Count: 17, over15Count: 24, over35Count: 8,
    avgGoalsScored: 1.73, avgGoalsConceded: 0.83, homeWins: 12, homePlayed: 15,
    awayWins: 6, awayPlayed: 15, form: ["W", "W", "D", "W", "L"] as const,
    lastMatches: [],
  };
  const awayStats = {
    played: 30, wins: 14, draws: 8, losses: 8, goalsFor: 40, goalsAgainst: 30,
    cleanSheets: 8, bttsCount: 18, over25Count: 16, over15Count: 22, over35Count: 7,
    avgGoalsScored: 1.33, avgGoalsConceded: 1.0, homeWins: 9, homePlayed: 15,
    awayWins: 5, awayPlayed: 15, form: ["D", "W", "W", "L", "W"] as const,
    lastMatches: [],
  };
  const pred: PredictionDetails = generatePrediction(homeStats, awayStats, [], match.homeTeam.name, match.odds);
  return {
    result: pred.matchResult.prediction,
    confidence: pred.combinedTip.confidence,
    goals: pred.totalGoals.prediction,
  };
}

async function fetchLive(): Promise<Match[]> {
  try {
    const res = await fetch("/api/live");
    const data = await res.json();
    return data.matches ?? [];
  } catch {
    return getDemoMatches().filter((m) => m.status === "live" || m.status === "halftime");
  }
}

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    fetchLive().then((m) => {
      if (active) { setMatches(m); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(() => {
      fetchLive().then(setMatches);
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  function handleRefresh() {
    setLoading(true);
    fetchLive().then((m) => { setMatches(m); setLoading(false); });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-2xl font-bold text-white">Canli Maclar</h1>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
            {matches.length} Mac
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              autoRefresh
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-gray-800 border-gray-700 text-gray-400"
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            {autoRefresh ? "Oto. Yenileme Acik" : "Oto. Yenileme Kapali"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Live Info Banner */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" />
          <p className="text-sm text-gray-300">
            Canli maclar <span className="text-red-400 font-medium">30 saniye</span> araliklarla otomatik guncellenir.
            AI tahminleri her guncellemeyle birlikte yeniden hesaplanir.
          </p>
        </div>
      </div>

      {/* Matches Grid */}
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={getQuickPrediction(match)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          {loading ? (
            <>
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
              <p className="text-gray-400">Canli maclar yukleniyor...</p>
            </>
          ) : (
            <>
              <Activity className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg font-medium">Su an canli mac yok</p>
              <p className="text-gray-500 text-sm mt-1">
                Canli maclar basladiginda burada gorunecek
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
