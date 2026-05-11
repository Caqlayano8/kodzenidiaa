"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Filter, RefreshCw, SlidersHorizontal } from "lucide-react";
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

async function fetchAllMatches(): Promise<Match[]> {
  try {
    const res = await fetch("/api/matches");
    const data = await res.json();
    return data.matches ?? [];
  } catch {
    return getDemoMatches();
  }
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("Tumu");
  const [minConfidence, setMinConfidence] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAllMatches().then((m) => {
      if (active) { setMatches(m); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  function handleRefresh() {
    setLoading(true);
    fetchAllMatches().then((m) => { setMatches(m); setLoading(false); });
  }

  const leagues = ["Tumu", ...new Set(matches.map((m) => m.league))];

  const filteredMatches = matches
    .filter((m) => m.status === "scheduled" || m.status === "live" || m.status === "halftime")
    .filter((m) => selectedLeague === "Tumu" || m.league === selectedLeague)
    .filter((m) => {
      if (minConfidence === 0) return true;
      const pred = getQuickPrediction(m);
      return pred.confidence >= minConfidence / 100;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            AI Tahminleri
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Tum maclar icin detayli AI tahminleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs hover:text-white transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtreler
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Filtreler</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Lig</label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {leagues.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Min. Guven: %{minConfidence}
              </label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-4">
        {filteredMatches.length} mac bulundu
      </p>

      {/* Matches */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
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
              <p className="text-gray-400">Tahminler yukleniyor...</p>
            </>
          ) : (
            <>
              <TrendingUp className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400">Filtrelere uygun mac bulunamadi</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
