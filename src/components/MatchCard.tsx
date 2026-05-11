"use client";

import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";
import type { Match } from "@/lib/types";
import { getStatusLabel, getStatusColor, formatOdds } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  prediction?: {
    result: string;
    confidence: number;
    goals: string;
  };
}

export default function MatchCard({ match, prediction }: MatchCardProps) {
  const isLive = match.status === "live" || match.status === "halftime";

  return (
    <Link href={`/mac/${match.id}`}>
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-gray-800/80 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{match.league}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">{match.leagueCountry}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}
          >
            {isLive && match.minute ? `${match.minute}'` : getStatusLabel(match.status)}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
              {match.homeTeam.name}
            </p>
          </div>

          <div className="mx-4 text-center min-w-[60px]">
            {match.homeScore !== undefined ? (
              <div className={`text-2xl font-bold ${isLive ? "text-emerald-400" : "text-white"}`}>
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{match.time}</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
              {match.awayTeam.name}
            </p>
          </div>
        </div>

        {/* Odds */}
        {match.odds && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-gray-900/50 rounded-lg py-1.5 text-center">
              <div className="text-xs text-gray-500">1</div>
              <div className="text-sm font-bold text-white">{formatOdds(match.odds.home)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 rounded-lg py-1.5 text-center">
              <div className="text-xs text-gray-500">X</div>
              <div className="text-sm font-bold text-white">{formatOdds(match.odds.draw)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 rounded-lg py-1.5 text-center">
              <div className="text-xs text-gray-500">2</div>
              <div className="text-sm font-bold text-white">{formatOdds(match.odds.away)}</div>
            </div>
          </div>
        )}

        {/* AI Prediction */}
        {prediction && (
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">AI Tahmini</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">{prediction.result}</span>
              <span className="text-xs text-gray-400">{prediction.goals}</span>
              <span className={`text-xs font-bold ${prediction.confidence >= 0.65 ? "text-emerald-400" : prediction.confidence >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                %{Math.round(prediction.confidence * 100)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
