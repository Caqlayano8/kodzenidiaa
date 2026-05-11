"use client";

import {
  Target,
  TrendingUp,
  BarChart3,
  Percent,
  Zap,
  Award,
} from "lucide-react";
import type { PredictionDetails } from "@/lib/types";
import {
  getConfidenceColor,
  getConfidenceBg,
  getConfidenceLabel,
  formatPercentage,
} from "@/lib/utils";

interface PredictionPanelProps {
  predictions: PredictionDetails;
  confidence: number;
}

export default function PredictionPanel({
  predictions,
  confidence,
}: PredictionPanelProps) {
  return (
    <div className="space-y-4">
      {/* Overall Confidence */}
      <div
        className={`rounded-xl border p-4 ${getConfidenceBg(confidence)}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              AI Genel Guven
            </span>
          </div>
          <span className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
            %{Math.round(confidence * 100)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${confidence >= 0.7 ? "bg-emerald-500" : confidence >= 0.5 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {getConfidenceLabel(confidence)}
        </p>
      </div>

      {/* Combined Tip */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold text-white">
            Kombinasyon Tahmini
          </span>
        </div>
        <p className="text-lg font-bold text-emerald-400 mb-2">
          {predictions.combinedTip.tip}
        </p>
        <div className="space-y-1">
          {predictions.combinedTip.reasoning.map((r, i) => (
            <p key={i} className="text-xs text-gray-400 flex items-start gap-1">
              <span className="text-emerald-400 mt-0.5">&#8226;</span>
              {r}
            </p>
          ))}
        </div>
      </div>

      {/* Match Result */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-white">Mac Sonucu</span>
          <span
            className={`ml-auto text-sm font-bold ${getConfidenceColor(predictions.matchResult.confidence)}`}
          >
            %{Math.round(predictions.matchResult.confidence * 100)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["1", predictions.matchResult.home],
              ["X", predictions.matchResult.draw],
              ["2", predictions.matchResult.away],
            ] as const
          ).map(([label, prob]) => (
            <div
              key={label}
              className={`rounded-lg p-3 text-center border ${
                predictions.matchResult.prediction === label
                  ? "bg-emerald-500/20 border-emerald-500/50"
                  : "bg-gray-900/50 border-gray-700/30"
              }`}
            >
              <div className="text-lg font-bold text-white">{label}</div>
              <div className="text-sm font-medium text-gray-300">
                {formatPercentage(prob)}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full ${predictions.matchResult.prediction === label ? "bg-emerald-500" : "bg-gray-500"}`}
                  style={{ width: `${prob * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Goals */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-bold text-white">Toplam Gol</span>
          <span
            className={`ml-auto text-sm font-bold ${getConfidenceColor(predictions.totalGoals.confidence)}`}
          >
            %{Math.round(predictions.totalGoals.confidence * 100)}
          </span>
        </div>
        <div className="text-center mb-3">
          <span className="text-3xl font-bold text-orange-400">
            {predictions.totalGoals.expectedGoals}
          </span>
          <p className="text-xs text-gray-400 mt-1">Beklenen Gol</p>
        </div>
        <div className="space-y-2">
          {(
            [
              ["Ust 1.5", predictions.totalGoals.over15],
              ["Ust 2.5", predictions.totalGoals.over25],
              ["Ust 3.5", predictions.totalGoals.over35],
            ] as const
          ).map(([label, prob]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{label}</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-orange-500"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-white">
                {formatPercentage(prob)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BTTS */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-bold text-white">
            Karsilikli Gol (KG)
          </span>
          <span
            className={`ml-auto text-sm font-bold ${getConfidenceColor(predictions.btts.confidence)}`}
          >
            %{Math.round(predictions.btts.confidence * 100)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`rounded-lg p-3 text-center border ${
              predictions.btts.prediction === "Evet"
                ? "bg-emerald-500/20 border-emerald-500/50"
                : "bg-gray-900/50 border-gray-700/30"
            }`}
          >
            <div className="text-sm font-bold text-white">Var</div>
            <div className="text-lg font-bold text-emerald-400">
              {formatPercentage(predictions.btts.yes)}
            </div>
          </div>
          <div
            className={`rounded-lg p-3 text-center border ${
              predictions.btts.prediction === "Hayir"
                ? "bg-red-500/20 border-red-500/50"
                : "bg-gray-900/50 border-gray-700/30"
            }`}
          >
            <div className="text-sm font-bold text-white">Yok</div>
            <div className="text-lg font-bold text-red-400">
              {formatPercentage(predictions.btts.no)}
            </div>
          </div>
        </div>
      </div>

      {/* Correct Score */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold text-white">Skor Tahmini</span>
        </div>
        <div className="space-y-2">
          {predictions.correctScore.scores.map((s, i) => (
            <div key={s.score} className="flex items-center justify-between">
              <span
                className={`text-sm font-bold ${i === 0 ? "text-cyan-400" : "text-gray-300"}`}
              >
                {s.score}
              </span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${i === 0 ? "bg-cyan-500" : "bg-gray-500"}`}
                    style={{
                      width: `${Math.min(s.probability * 500, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {formatPercentage(s.probability)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Double Chance */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-pink-400" />
          <span className="text-sm font-bold text-white">Cifte Sans</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["1X", predictions.doubleChance.homeOrDraw],
              ["12", predictions.doubleChance.homeOrAway],
              ["X2", predictions.doubleChance.drawOrAway],
            ] as const
          ).map(([label, prob]) => (
            <div
              key={label}
              className={`rounded-lg p-2 text-center border ${
                predictions.doubleChance.prediction === label
                  ? "bg-pink-500/20 border-pink-500/50"
                  : "bg-gray-900/50 border-gray-700/30"
              }`}
            >
              <div className="text-sm font-bold text-white">{label}</div>
              <div className="text-xs text-gray-300">
                {formatPercentage(prob)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Half Time */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-bold text-white">
            Ilk Yari Sonucu
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["1", predictions.halfTimeResult.home],
              ["X", predictions.halfTimeResult.draw],
              ["2", predictions.halfTimeResult.away],
            ] as const
          ).map(([label, prob]) => (
            <div
              key={label}
              className={`rounded-lg p-2 text-center border ${
                predictions.halfTimeResult.prediction === label
                  ? "bg-yellow-500/20 border-yellow-500/50"
                  : "bg-gray-900/50 border-gray-700/30"
              }`}
            >
              <div className="text-sm font-bold text-white">{label}</div>
              <div className="text-xs text-gray-300">
                {formatPercentage(prob)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
