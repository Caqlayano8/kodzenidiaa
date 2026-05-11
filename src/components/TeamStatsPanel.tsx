"use client";

import type { TeamStats } from "@/lib/types";
import { getFormColor } from "@/lib/utils";

interface TeamStatsPanelProps {
  stats: TeamStats;
  teamName: string;
  isHome: boolean;
}

export default function TeamStatsPanel({
  stats,
  teamName,
  isHome,
}: TeamStatsPanelProps) {
  const winRate = stats.played > 0 ? (stats.wins / stats.played) * 100 : 0;
  const overRate =
    stats.played > 0 ? (stats.over25Count / stats.played) * 100 : 0;
  const bttsRate =
    stats.played > 0 ? (stats.bttsCount / stats.played) * 100 : 0;

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-3 h-3 rounded-full ${isHome ? "bg-blue-400" : "bg-red-400"}`}
        />
        <h3 className="text-sm font-bold text-white">{teamName}</h3>
        <span className="text-xs text-gray-500">
          {isHome ? "(Ev Sahibi)" : "(Deplasman)"}
        </span>
      </div>

      {/* Form */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-xs text-gray-400 mr-2">Form:</span>
        {stats.form.map((f, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded ${getFormColor(f)} flex items-center justify-center text-xs font-bold text-white`}
          >
            {f === "W" ? "G" : f === "D" ? "B" : "M"}
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Mac" value={`${stats.played}`} />
        <StatItem
          label="Galibiyet"
          value={`${stats.wins}`}
          sub={`${winRate.toFixed(0)}%`}
        />
        <StatItem label="Beraberlik" value={`${stats.draws}`} />
        <StatItem label="Maglubiyet" value={`${stats.losses}`} />
        <StatItem
          label="Att. Gol"
          value={`${stats.goalsFor}`}
          sub={`ort. ${stats.avgGoalsScored.toFixed(1)}`}
        />
        <StatItem
          label="Yed. Gol"
          value={`${stats.goalsAgainst}`}
          sub={`ort. ${stats.avgGoalsConceded.toFixed(1)}`}
        />
        <StatItem
          label="Ust 2.5"
          value={`${overRate.toFixed(0)}%`}
          highlight={overRate > 55}
        />
        <StatItem
          label="KG Var"
          value={`${bttsRate.toFixed(0)}%`}
          highlight={bttsRate > 55}
        />
        <StatItem label="G.Kale" value={`${stats.cleanSheets}`} />
        <StatItem
          label={isHome ? "Ev Gal." : "Dep. Gal."}
          value={`${isHome ? stats.homeWins : stats.awayWins}`}
          sub={`/ ${isHome ? stats.homePlayed : stats.awayPlayed}`}
        />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-sm font-bold ${highlight ? "text-emerald-400" : "text-white"}`}
      >
        {value}
        {sub && (
          <span className="text-xs text-gray-500 font-normal ml-1">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
