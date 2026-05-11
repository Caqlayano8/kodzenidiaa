"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import PredictionPanel from "@/components/PredictionPanel";
import TeamStatsPanel from "@/components/TeamStatsPanel";
import type { Prediction, PastMatch } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/utils";

async function fetchPrediction(matchId: string): Promise<Prediction | null> {
  try {
    const res = await fetch(`/api/predictions?matchId=${matchId}`);
    const data = await res.json();
    if (data.error) return null;
    return data.prediction;
  } catch {
    return null;
  }
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchPrediction(matchId).then((p) => {
      if (!active) return;
      if (p) {
        setPrediction(p);
      } else {
        setError("Tahmin yuklenirken hata olustu");
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [matchId]);

  function handleReload() {
    setLoading(true);
    setError("");
    fetchPrediction(matchId).then((p) => {
      if (p) setPrediction(p);
      else setError("Tahmin yuklenirken hata olustu");
      setLoading(false);
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-gray-400">AI analiz yapiliyor...</p>
        <p className="text-gray-500 text-sm mt-1">
          Takim istatistikleri ve gecmis maclar taranyor
        </p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400 text-lg mb-4">{error || "Mac bulunamadi"}</p>
        <Link
          href="/"
          className="text-emerald-400 hover:text-emerald-300 text-sm"
        >
          Ana Sayfaya Don
        </Link>
      </div>
    );
  }

  const { match } = prediction;
  const isLive = match.status === "live" || match.status === "halftime";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri Don
      </Link>

      {/* Match Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{match.league}</span>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-500">{match.leagueCountry}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
            {isLive && match.minute
              ? `CANLI ${match.minute}'`
              : getStatusLabel(match.status)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-8 mb-4">
          <div className="text-center flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {match.homeTeam.name}
            </h2>
            <span className="text-xs text-gray-500">Ev Sahibi</span>
          </div>

          <div className="text-center">
            {match.homeScore !== undefined ? (
              <div className={`text-4xl font-bold ${isLive ? "text-emerald-400" : "text-white"}`}>
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xl font-bold">{match.time}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{match.date}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {match.awayTeam.name}
            </h2>
            <span className="text-xs text-gray-500">Deplasman</span>
          </div>
        </div>

        {/* Odds Row */}
        {match.odds && (
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1 bg-gray-900/50 border border-gray-700/30 rounded-lg py-2 text-center">
              <div className="text-xs text-gray-500">MS 1</div>
              <div className="text-sm font-bold text-white">{match.odds.home.toFixed(2)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 border border-gray-700/30 rounded-lg py-2 text-center">
              <div className="text-xs text-gray-500">MS X</div>
              <div className="text-sm font-bold text-white">{match.odds.draw.toFixed(2)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 border border-gray-700/30 rounded-lg py-2 text-center">
              <div className="text-xs text-gray-500">MS 2</div>
              <div className="text-sm font-bold text-white">{match.odds.away.toFixed(2)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 border border-gray-700/30 rounded-lg py-2 text-center">
              <div className="text-xs text-gray-500">U 2.5</div>
              <div className="text-sm font-bold text-white">{match.odds.over25.toFixed(2)}</div>
            </div>
            <div className="flex-1 bg-gray-900/50 border border-gray-700/30 rounded-lg py-2 text-center">
              <div className="text-xs text-gray-500">KG</div>
              <div className="text-sm font-bold text-white">{match.odds.btts_yes.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Predictions */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">AI Tahminleri</h3>
            <button
              onClick={handleReload}
              className="ml-auto flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Yeniden Hesapla
            </button>
          </div>
          <PredictionPanel
            predictions={prediction.predictions}
            confidence={prediction.confidence}
          />
        </div>

        {/* Right: Team Stats & H2H */}
        <div className="space-y-4">
          <TeamStatsPanel
            stats={prediction.homeTeamStats}
            teamName={match.homeTeam.name}
            isHome={true}
          />
          <TeamStatsPanel
            stats={prediction.awayTeamStats}
            teamName={match.awayTeam.name}
            isHome={false}
          />

          {/* H2H */}
          {prediction.headToHead.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">
                Karsilasma Gecmisi
              </h3>
              <div className="space-y-2">
                {prediction.headToHead.map((h2h: PastMatch, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="text-gray-500 w-20">{h2h.date}</span>
                    <span className="text-white font-medium flex-1 text-right">
                      {h2h.homeTeam}
                    </span>
                    <span className="text-emerald-400 font-bold mx-2">
                      {h2h.homeScore} - {h2h.awayScore}
                    </span>
                    <span className="text-white font-medium flex-1">
                      {h2h.awayTeam}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
        <p className="text-xs text-yellow-400/70 text-center">
          Bu tahminler yapay zeka modelleri tarafindan uretilmistir. Bilgi amacidir, yatirim tavsiyesi degildir.
          Sorumlu oynayin.
        </p>
      </div>
    </div>
  );
}
