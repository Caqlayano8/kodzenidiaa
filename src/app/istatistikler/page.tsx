"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Zap,
  RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";

const StatsChart = dynamic(() => import("@/components/StatsChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-800/50 rounded-xl flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-gray-500 animate-spin" />
    </div>
  ),
});

interface Stats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  todayPredictions: number;
  todayCorrect: number;
  todayAccuracy: number;
  streaks: { currentWin: number; bestWin: number };
  byMarket: Record<string, { total: number; correct: number; accuracy: number }>;
  dailyStats: Array<{
    date: string;
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
  }>;
  leagueAccuracy: Array<{ league: string; accuracy: number; predictions: number }>;
}

async function fetchStats(): Promise<Stats | null> {
  try {
    const res = await fetch("/api/statistics");
    const data = await res.json();
    return data.stats;
  } catch {
    return null;
  }
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStats().then((s) => {
      if (active) { setStats(s); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-gray-400">Istatistikler yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">AI Istatistikleri</h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Toplam Tahmin"
          value={stats.totalPredictions.toLocaleString()}
          sub={`${stats.correctPredictions} dogru`}
          color="text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Genel Isabet"
          value={`%${stats.accuracy}`}
          sub="tum zamanlar"
          color="text-emerald-400"
        />
        <StatCard
          icon={Zap}
          label="Bugun"
          value={`%${stats.todayAccuracy}`}
          sub={`${stats.todayCorrect}/${stats.todayPredictions}`}
          color="text-yellow-400"
        />
        <StatCard
          icon={Award}
          label="En Iyi Seri"
          value={`${stats.streaks.bestWin}`}
          sub={`simdi: ${stats.streaks.currentWin}`}
          color="text-purple-400"
        />
      </div>

      {/* Accuracy Chart */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-8">
        <h2 className="text-sm font-bold text-white mb-4">
          Gunluk Isabet Orani (Son 30 Gun)
        </h2>
        <StatsChart data={stats.dailyStats} />
      </div>

      {/* By Market */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white mb-4">Pazar Bazli Isabet</h2>
          <div className="space-y-3">
            {Object.entries(stats.byMarket).map(([market, data]) => (
              <div key={market}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{getMarketLabel(market)}</span>
                  <span className="text-xs font-bold text-white">%{data.accuracy}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${data.accuracy >= 65 ? "bg-emerald-500" : data.accuracy >= 55 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {data.correct}/{data.total} tahmin
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white mb-4">Lig Bazli Isabet</h2>
          <div className="space-y-3">
            {stats.leagueAccuracy.map((league) => (
              <div key={league.league}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{league.league}</span>
                  <span className="text-xs font-bold text-white">%{league.accuracy}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${league.accuracy >= 65 ? "bg-emerald-500" : league.accuracy >= 55 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${league.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {league.predictions} tahmin
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-400/70 text-center">
          Istatistikler AI modelinin performansini gostermektedir. Gecmis performans gelecek sonuclari garanti etmez.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

function getMarketLabel(market: string): string {
  const labels: Record<string, string> = {
    matchResult: "Mac Sonucu (1X2)",
    over25: "Ust/Alt 2.5",
    btts: "Karsilikli Gol",
    doubleChance: "Cifte Sans",
  };
  return labels[market] ?? market;
}
