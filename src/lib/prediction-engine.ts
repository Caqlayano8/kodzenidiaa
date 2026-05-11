import type {
  TeamStats,
  PastMatch,
  PredictionDetails,
  MatchOdds,
} from "./types";

function poissonProbability(lambda: number, k: number): number {
  const result = Math.exp(-lambda) * Math.pow(lambda, k);
  let factorial = 1;
  for (let i = 2; i <= k; i++) {
    factorial *= i;
  }
  return result / factorial;
}

function calculateAttackStrength(
  teamAvgGoals: number,
  leagueAvgGoals: number
): number {
  if (leagueAvgGoals === 0) return 1;
  return teamAvgGoals / leagueAvgGoals;
}

function calculateDefenseStrength(
  teamAvgConceded: number,
  leagueAvgGoals: number
): number {
  if (leagueAvgGoals === 0) return 1;
  return teamAvgConceded / leagueAvgGoals;
}

function getFormWeight(form: readonly ("W" | "D" | "L")[]): number {
  if (form.length === 0) return 0.5;
  const weights = [1.0, 0.9, 0.8, 0.7, 0.6];
  let score = 0;
  let totalWeight = 0;

  for (let i = 0; i < Math.min(form.length, 5); i++) {
    const w = weights[i];
    if (form[i] === "W") score += 3 * w;
    else if (form[i] === "D") score += 1 * w;
    totalWeight += 3 * w;
  }

  return totalWeight > 0 ? score / totalWeight : 0.5;
}

function analyzeHeadToHead(
  h2h: PastMatch[],
  homeTeamName: string
): { homeWinRate: number; drawRate: number; avgGoals: number } {
  if (h2h.length === 0) {
    return { homeWinRate: 0.4, drawRate: 0.3, avgGoals: 2.5 };
  }

  let homeWins = 0;
  let draws = 0;
  let totalGoals = 0;

  for (const match of h2h) {
    totalGoals += match.homeScore + match.awayScore;
    if (match.homeTeam === homeTeamName) {
      if (match.homeScore > match.awayScore) homeWins++;
      else if (match.homeScore === match.awayScore) draws++;
    } else {
      if (match.awayScore > match.homeScore) homeWins++;
      else if (match.homeScore === match.awayScore) draws++;
    }
  }

  return {
    homeWinRate: homeWins / h2h.length,
    drawRate: draws / h2h.length,
    avgGoals: totalGoals / h2h.length,
  };
}

function calculateExpectedGoals(
  attackStrength: number,
  opponentDefenseStrength: number,
  leagueAvg: number,
  isHome: boolean
): number {
  const homeAdvantage = isHome ? 1.15 : 0.9;
  return attackStrength * opponentDefenseStrength * leagueAvg * homeAdvantage;
}

function generateScoreMatrix(
  homeExpected: number,
  awayExpected: number,
  maxGoals: number = 6
): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i <= maxGoals; i++) {
    matrix[i] = [];
    for (let j = 0; j <= maxGoals; j++) {
      matrix[i][j] =
        poissonProbability(homeExpected, i) *
        poissonProbability(awayExpected, j);
    }
  }
  return matrix;
}

function integrateOdds(
  modelProb: number,
  oddsImpliedProb: number,
  oddsWeight: number = 0.3
): number {
  return modelProb * (1 - oddsWeight) + oddsImpliedProb * oddsWeight;
}

function oddsToProb(odds: number): number {
  if (odds <= 0) return 0;
  return 1 / odds;
}

export function generatePrediction(
  homeStats: TeamStats,
  awayStats: TeamStats,
  headToHead: PastMatch[],
  homeTeamName: string,
  odds?: MatchOdds
): PredictionDetails {
  const leagueAvgGoals = 1.35;

  const homeAttack = calculateAttackStrength(
    homeStats.avgGoalsScored,
    leagueAvgGoals
  );
  const homeDefense = calculateDefenseStrength(
    homeStats.avgGoalsConceded,
    leagueAvgGoals
  );
  const awayAttack = calculateAttackStrength(
    awayStats.avgGoalsScored,
    leagueAvgGoals
  );
  const awayDefense = calculateDefenseStrength(
    awayStats.avgGoalsConceded,
    leagueAvgGoals
  );

  const homeExpected = calculateExpectedGoals(
    homeAttack,
    awayDefense,
    leagueAvgGoals,
    true
  );
  const awayExpected = calculateExpectedGoals(
    awayAttack,
    homeDefense,
    leagueAvgGoals,
    false
  );

  const scoreMatrix = generateScoreMatrix(homeExpected, awayExpected);
  const maxGoals = 6;

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over15Prob = 0;
  let over25Prob = 0;
  let over35Prob = 0;
  let bttsYesProb = 0;

  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      const p = scoreMatrix[i][j];
      if (i > j) homeWinProb += p;
      else if (i === j) drawProb += p;
      else awayWinProb += p;

      if (i + j > 1.5) over15Prob += p;
      if (i + j > 2.5) over25Prob += p;
      if (i + j > 3.5) over35Prob += p;
      if (i > 0 && j > 0) bttsYesProb += p;
    }
  }

  const h2hAnalysis = analyzeHeadToHead(headToHead, homeTeamName);
  const homeForm = getFormWeight(homeStats.form);
  const awayForm = getFormWeight(awayStats.form);

  const formAdjustment = (homeForm - awayForm) * 0.1;
  homeWinProb = Math.min(0.95, Math.max(0.02, homeWinProb + formAdjustment));
  awayWinProb = Math.min(0.95, Math.max(0.02, awayWinProb - formAdjustment));

  const h2hAdjustment = (h2hAnalysis.homeWinRate - 0.4) * 0.08;
  homeWinProb = Math.min(0.95, Math.max(0.02, homeWinProb + h2hAdjustment));
  awayWinProb = Math.min(0.95, Math.max(0.02, awayWinProb - h2hAdjustment));

  const totalProb = homeWinProb + drawProb + awayWinProb;
  homeWinProb /= totalProb;
  drawProb /= totalProb;
  awayWinProb /= totalProb;

  if (odds) {
    const margin =
      oddsToProb(odds.home) + oddsToProb(odds.draw) + oddsToProb(odds.away);
    if (margin > 0) {
      homeWinProb = integrateOdds(
        homeWinProb,
        oddsToProb(odds.home) / margin
      );
      drawProb = integrateOdds(drawProb, oddsToProb(odds.draw) / margin);
      awayWinProb = integrateOdds(
        awayWinProb,
        oddsToProb(odds.away) / margin
      );

      const adjTotal = homeWinProb + drawProb + awayWinProb;
      homeWinProb /= adjTotal;
      drawProb /= adjTotal;
      awayWinProb /= adjTotal;
    }

    over25Prob = integrateOdds(over25Prob, oddsToProb(odds.over25));
    over15Prob = integrateOdds(over15Prob, oddsToProb(odds.over15));
    over35Prob = integrateOdds(over35Prob, oddsToProb(odds.over35));
    bttsYesProb = integrateOdds(bttsYesProb, oddsToProb(odds.btts_yes));
  }

  let matchResultPrediction: "1" | "X" | "2";
  let matchResultConfidence: number;
  if (homeWinProb >= drawProb && homeWinProb >= awayWinProb) {
    matchResultPrediction = "1";
    matchResultConfidence = homeWinProb;
  } else if (awayWinProb >= drawProb) {
    matchResultPrediction = "2";
    matchResultConfidence = awayWinProb;
  } else {
    matchResultPrediction = "X";
    matchResultConfidence = drawProb;
  }

  const expectedGoals = homeExpected + awayExpected;
  let goalsPrediction: string;
  if (expectedGoals < 1.8) goalsPrediction = "Alt 2.5";
  else if (expectedGoals < 2.8) goalsPrediction = "2-3 Gol";
  else goalsPrediction = "Ust 2.5";

  const scores: Array<{ score: string; probability: number }> = [];
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      scores.push({
        score: `${i}-${j}`,
        probability: scoreMatrix[i]?.[j] ?? 0,
      });
    }
  }
  scores.sort((a, b) => b.probability - a.probability);
  const topScores = scores.slice(0, 5);

  let htHomeProbability = homeWinProb * 0.7;
  let htDrawProbability = drawProb * 1.3 + 0.1;
  let htAwayProbability = awayWinProb * 0.65;
  const htTotal = htHomeProbability + htDrawProbability + htAwayProbability;
  htHomeProbability /= htTotal;
  htDrawProbability /= htTotal;
  htAwayProbability /= htTotal;

  let htPrediction: "1" | "X" | "2";
  if (htHomeProbability >= htDrawProbability && htHomeProbability >= htAwayProbability) {
    htPrediction = "1";
  } else if (htAwayProbability >= htDrawProbability) {
    htPrediction = "2";
  } else {
    htPrediction = "X";
  }

  const homeOrDraw = homeWinProb + drawProb;
  const homeOrAway = homeWinProb + awayWinProb;
  const drawOrAway = drawProb + awayWinProb;

  let dcPrediction: string;
  let dcConfidence: number;
  if (homeOrDraw >= homeOrAway && homeOrDraw >= drawOrAway) {
    dcPrediction = "1X";
    dcConfidence = homeOrDraw;
  } else if (homeOrAway >= drawOrAway) {
    dcPrediction = "12";
    dcConfidence = homeOrAway;
  } else {
    dcPrediction = "X2";
    dcConfidence = drawOrAway;
  }

  const reasoning: string[] = [];
  if (homeForm > 0.6) reasoning.push(`Ev sahibi iyi formda (${(homeForm * 100).toFixed(0)}%)`);
  if (awayForm > 0.6) reasoning.push(`Deplasman takimi iyi formda (${(awayForm * 100).toFixed(0)}%)`);
  if (h2hAnalysis.homeWinRate > 0.5) reasoning.push("Ev sahibi h2h'de baskin");
  if (h2hAnalysis.avgGoals > 2.5) reasoning.push("H2H maclarda yuksek gol ortalamasi");
  if (homeStats.over25Count / Math.max(homeStats.played, 1) > 0.6)
    reasoning.push("Ev sahibi maclarinda ust 2.5 orani yuksek");
  if (awayStats.over25Count / Math.max(awayStats.played, 1) > 0.6)
    reasoning.push("Deplasman maclarinda ust 2.5 orani yuksek");
  if (matchResultConfidence > 0.55)
    reasoning.push(`Guclu mac sonucu tahmini: ${matchResultPrediction} (${(matchResultConfidence * 100).toFixed(0)}%)`);

  const combinedConfidence =
    matchResultConfidence * 0.4 +
    Math.max(over25Prob, 1 - over25Prob) * 0.3 +
    Math.max(bttsYesProb, 1 - bttsYesProb) * 0.15 +
    dcConfidence * 0.15;

  const combinedTip = `${matchResultPrediction} & ${goalsPrediction} & KG ${bttsYesProb > 0.5 ? "Var" : "Yok"}`;

  return {
    matchResult: {
      home: Math.round(homeWinProb * 100) / 100,
      draw: Math.round(drawProb * 100) / 100,
      away: Math.round(awayWinProb * 100) / 100,
      prediction: matchResultPrediction,
      confidence: Math.round(matchResultConfidence * 100) / 100,
    },
    totalGoals: {
      over15: Math.round(over15Prob * 100) / 100,
      over25: Math.round(over25Prob * 100) / 100,
      over35: Math.round(over35Prob * 100) / 100,
      expectedGoals: Math.round(expectedGoals * 100) / 100,
      prediction: goalsPrediction,
      confidence:
        Math.round(Math.max(over25Prob, 1 - over25Prob) * 100) / 100,
    },
    btts: {
      yes: Math.round(bttsYesProb * 100) / 100,
      no: Math.round((1 - bttsYesProb) * 100) / 100,
      prediction: bttsYesProb > 0.5 ? "Evet" : "Hayir",
      confidence:
        Math.round(Math.max(bttsYesProb, 1 - bttsYesProb) * 100) / 100,
    },
    correctScore: {
      scores: topScores.map((s) => ({
        score: s.score,
        probability: Math.round(s.probability * 100) / 100,
      })),
      prediction: topScores[0]?.score ?? "1-1",
      confidence: Math.round((topScores[0]?.probability ?? 0.1) * 100) / 100,
    },
    halfTimeResult: {
      home: Math.round(htHomeProbability * 100) / 100,
      draw: Math.round(htDrawProbability * 100) / 100,
      away: Math.round(htAwayProbability * 100) / 100,
      prediction: htPrediction,
      confidence:
        Math.round(
          Math.max(htHomeProbability, htDrawProbability, htAwayProbability) *
            100
        ) / 100,
    },
    doubleChance: {
      homeOrDraw: Math.round(homeOrDraw * 100) / 100,
      homeOrAway: Math.round(homeOrAway * 100) / 100,
      drawOrAway: Math.round(drawOrAway * 100) / 100,
      prediction: dcPrediction,
      confidence: Math.round(dcConfidence * 100) / 100,
    },
    combinedTip: {
      tip: combinedTip,
      confidence: Math.round(combinedConfidence * 100) / 100,
      reasoning,
    },
  };
}
