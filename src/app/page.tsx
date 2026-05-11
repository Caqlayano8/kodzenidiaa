"use client";

import { useEffect, useState, useRef } from "react";
import {
  Activity,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import type { Match, PredictionDetails } from "@/lib/types";
import { generatePrediction } from "@/lib/prediction-engine";
import { getDemoMatches } from "@/lib/football-api";

interface MatchPredictionSummary {
  result: string;
  confidence: number;
  goals: string;
}

function getQuickPrediction(match: Match): MatchPredictionSummary {
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

  const pred: PredictionDetails = generatePrediction(
    homeStats,
    awayStats,
    [],
    match.homeTeam.name,
    match.odds
  );
  return {
    result: pred.matchResult.prediction,
    confidence: pred.combinedTip.confidence,
    goals: pred.totalGoals.prediction,
  };
}

async function fetchMatches(): Promise<{ matches: Match[]; time: string }> {
  try {
    const res = await fetch("/api/matches");
    const data = await res.json();
    return {
      matches: data.matches ?? [],
      time: new Date().toLocaleTimeString("tr-TR"),
    };
  } catch {
    return {
      matches: getDemoMatches(),
      time: new Date().toLocaleTimeString("tr-TR"),
    };
  }
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await fetchMatches();
      if (active) {
        setMatches(result.matches);
        setLastUpdate(result.time);
        setLoading(false);
      }
    }

    load();

    intervalRef.current = setInterval(() => {
      fetchMatches().then((result) => {
        if (active) {
          setMatches(result.matches);
          setLastUpdate(result.time);
        }
      });
    }, 60000);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleRefresh() {
    setLoading(true);
    fetchMatches().then((result) => {
      setMatches(result.matches);
      setLastUpdate(result.time);
      setLoading(false);
    });
  }

  const liveMatches = matches.filter(
    (m) => m.status === "live" || m.status === "halftime"
  );
  const scheduledMatches = matches.filter((m) => m.status === "scheduled");
  const finishedMatches = matches.filter((m) => m.status === "finished");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                <span className="gradient-text">KodzenIdiaa</span> AI Tahmin
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Yapay zeka ile mac analizleri, gol tahminleri ve yuksek isabet
                oranli iddaa tahminleri
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <QuickStat
              icon={Activity}
              label="Canli Mac"
              value={String(liveMatches.length)}
              color="text-red-400"
            />
            <QuickStat
              icon={Target}
              label="Bugun"
              value={String(matches.length)}
              color="text-blue-400"
            />
            <QuickStat
              icon={TrendingUp}
              label="Isabet"
              value="%66"
              color="text-emerald-400"
            />
            <QuickStat
              icon={Zap}
              label="AI Guven"
              value="Yuksek"
              color="text-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <p className="text-xs text-gray-500 mb-4">
          Son guncelleme: {lastUpdate}
        </p>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-lg font-bold text-white">Canli Maclar</h2>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                {liveMatches.length}
              </span>
            </div>
            <Link
              href="/canli"
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Tumu <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getQuickPrediction(match)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {scheduledMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">
                Yaklasan Maclar
              </h2>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {scheduledMatches.length}
              </span>
            </div>
            <Link
              href="/tahminler"
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Tum Tahminler <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getQuickPrediction(match)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-white">Biten Maclar</h2>
            <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded-full">
              {finishedMatches.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finishedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {loading && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
          <p className="text-gray-400">Maclar yukleniyor...</p>
        </div>
      )}
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
