export interface Team {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  league?: string;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  bttsCount: number;
  over25Count: number;
  over15Count: number;
  over35Count: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  homeWins: number;
  homePlayed: number;
  awayWins: number;
  awayPlayed: number;
  form: readonly MatchResult[];
  lastMatches: readonly PastMatch[];
}

export interface PastMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  league: string;
}

export type MatchResult = "W" | "D" | "L";

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  leagueCountry: string;
  date: string;
  time: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  odds?: MatchOdds;
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed";

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25: number;
  under25: number;
  over15: number;
  under15: number;
  over35: number;
  under35: number;
  btts_yes: number;
  btts_no: number;
}

export interface Prediction {
  matchId: string;
  match: Match;
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  headToHead: PastMatch[];
  predictions: PredictionDetails;
  confidence: number;
  timestamp: string;
}

export interface PredictionDetails {
  matchResult: {
    home: number;
    draw: number;
    away: number;
    prediction: "1" | "X" | "2";
    confidence: number;
  };
  totalGoals: {
    over15: number;
    over25: number;
    over35: number;
    expectedGoals: number;
    prediction: string;
    confidence: number;
  };
  btts: {
    yes: number;
    no: number;
    prediction: "Evet" | "Hayir";
    confidence: number;
  };
  correctScore: {
    scores: Array<{ score: string; probability: number }>;
    prediction: string;
    confidence: number;
  };
  halfTimeResult: {
    home: number;
    draw: number;
    away: number;
    prediction: "1" | "X" | "2";
    confidence: number;
  };
  doubleChance: {
    homeOrDraw: number;
    homeOrAway: number;
    drawOrAway: number;
    prediction: string;
    confidence: number;
  };
  combinedTip: {
    tip: string;
    confidence: number;
    reasoning: string[];
  };
}

export interface LeagueStanding {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: MatchResult[];
}

export interface DailyStats {
  date: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

export interface FilterOptions {
  league?: string;
  date?: string;
  minConfidence?: number;
  status?: MatchStatus;
}
