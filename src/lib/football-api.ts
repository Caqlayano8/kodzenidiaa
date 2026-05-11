import type { Match, TeamStats, PastMatch, MatchOdds } from "./types";

const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_HOST = "v3.football.api-sports.io";
const BASE_URL = `https://${API_HOST}`;

async function apiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!API_KEY) return null;

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "x-apisports-key": API_KEY,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as T;
  } catch {
    return null;
  }
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiResponse<T> {
  response: T[];
}

function mapStatus(short: string): Match["status"] {
  if (["NS", "TBD"].includes(short)) return "scheduled";
  if (["1H", "2H", "ET", "P", "BT", "LIVE"].includes(short)) return "live";
  if (short === "HT") return "halftime";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  return "postponed";
}

function formatFixture(f: ApiFixture): Match {
  const d = new Date(f.fixture.date);
  return {
    id: String(f.fixture.id),
    homeTeam: {
      id: String(f.teams.home.id),
      name: f.teams.home.name,
      logo: f.teams.home.logo,
    },
    awayTeam: {
      id: String(f.teams.away.id),
      name: f.teams.away.name,
      logo: f.teams.away.logo,
    },
    league: f.league.name,
    leagueCountry: f.league.country,
    date: d.toISOString().split("T")[0],
    time: d.toTimeString().slice(0, 5),
    status: mapStatus(f.fixture.status.short),
    homeScore: f.goals.home ?? undefined,
    awayScore: f.goals.away ?? undefined,
    minute: f.fixture.status.elapsed ?? undefined,
  };
}

export async function fetchTodayMatches(): Promise<Match[]> {
  const today = new Date().toISOString().split("T")[0];
  const data = await apiFetch<ApiResponse<ApiFixture>>("/fixtures", {
    date: today,
  });
  if (!data) return getDemoMatches();
  return data.response.map(formatFixture);
}

export async function fetchLiveMatches(): Promise<Match[]> {
  const data = await apiFetch<ApiResponse<ApiFixture>>("/fixtures", {
    live: "all",
  });
  if (!data) return getDemoMatches().filter((m) => m.status === "live");
  return data.response.map(formatFixture);
}

interface ApiTeamStat {
  league: { fixtures: { played: { total: number } } };
  fixtures: {
    wins: { total: number; home: number; away: number };
    draws: { total: number };
    loses: { total: number };
  };
  goals: {
    for: { total: { total: number }; average: { total: string } };
    against: { total: { total: number }; average: { total: string } };
  };
  clean_sheet: { total: number };
}

export async function fetchTeamStats(
  teamId: string,
  leagueId: string = "203",
  season: string = "2024"
): Promise<TeamStats> {
  const data = await apiFetch<ApiResponse<ApiTeamStat>>("/teams/statistics", {
    team: teamId,
    league: leagueId,
    season,
  });

  if (!data || data.response.length === 0) {
    return generateDemoTeamStats();
  }

  const s = data.response[0];
  const played = s.league.fixtures.played.total || 1;
  const goalsFor = s.goals.for.total.total;
  const goalsAgainst = s.goals.against.total.total;

  return {
    played,
    wins: s.fixtures.wins.total,
    draws: s.fixtures.draws.total,
    losses: s.fixtures.loses.total,
    goalsFor,
    goalsAgainst,
    cleanSheets: s.clean_sheet.total,
    bttsCount: Math.round(played * 0.55),
    over25Count: Math.round(played * 0.52),
    over15Count: Math.round(played * 0.72),
    over35Count: Math.round(played * 0.3),
    avgGoalsScored: goalsFor / played,
    avgGoalsConceded: goalsAgainst / played,
    homeWins: s.fixtures.wins.home,
    homePlayed: Math.round(played / 2),
    awayWins: s.fixtures.wins.away,
    awayPlayed: Math.round(played / 2),
    form: generateFormFromWins(s.fixtures.wins.total, s.fixtures.draws.total, played),
    lastMatches: [],
  };
}

function generateFormFromWins(
  wins: number,
  draws: number,
  played: number
): Array<"W" | "D" | "L"> {
  const form: Array<"W" | "D" | "L"> = [];
  const wRate = wins / Math.max(played, 1);
  const dRate = draws / Math.max(played, 1);
  for (let i = 0; i < 5; i++) {
    const r = Math.random();
    if (r < wRate) form.push("W");
    else if (r < wRate + dRate) form.push("D");
    else form.push("L");
  }
  return form;
}

export async function fetchHeadToHead(
  team1Id: string,
  team2Id: string
): Promise<PastMatch[]> {
  const data = await apiFetch<ApiResponse<ApiFixture>>("/fixtures/headtohead", {
    h2h: `${team1Id}-${team2Id}`,
    last: "10",
  });

  if (!data) return getDemoH2H();

  return data.response.map((f) => ({
    date: new Date(f.fixture.date).toISOString().split("T")[0],
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    homeScore: f.goals.home ?? 0,
    awayScore: f.goals.away ?? 0,
    league: f.league.name,
  }));
}

export async function fetchOdds(fixtureId: string): Promise<MatchOdds | undefined> {
  const data = await apiFetch<ApiResponse<{
    bookmakers: Array<{
      bets: Array<{
        name: string;
        values: Array<{ value: string; odd: string }>;
      }>;
    }>;
  }>>("/odds", {
    fixture: fixtureId,
  });

  if (!data || data.response.length === 0) return undefined;

  const bookmaker = data.response[0].bookmakers[0];
  if (!bookmaker) return undefined;

  const odds: Partial<MatchOdds> = {};

  for (const bet of bookmaker.bets) {
    if (bet.name === "Match Winner") {
      for (const v of bet.values) {
        if (v.value === "Home") odds.home = parseFloat(v.odd);
        if (v.value === "Draw") odds.draw = parseFloat(v.odd);
        if (v.value === "Away") odds.away = parseFloat(v.odd);
      }
    }
    if (bet.name === "Goals Over/Under") {
      for (const v of bet.values) {
        if (v.value === "Over 2.5") odds.over25 = parseFloat(v.odd);
        if (v.value === "Under 2.5") odds.under25 = parseFloat(v.odd);
        if (v.value === "Over 1.5") odds.over15 = parseFloat(v.odd);
        if (v.value === "Under 1.5") odds.under15 = parseFloat(v.odd);
        if (v.value === "Over 3.5") odds.over35 = parseFloat(v.odd);
        if (v.value === "Under 3.5") odds.under35 = parseFloat(v.odd);
      }
    }
    if (bet.name === "Both Teams Score") {
      for (const v of bet.values) {
        if (v.value === "Yes") odds.btts_yes = parseFloat(v.odd);
        if (v.value === "No") odds.btts_no = parseFloat(v.odd);
      }
    }
  }

  return {
    home: odds.home ?? 2.0,
    draw: odds.draw ?? 3.2,
    away: odds.away ?? 3.5,
    over25: odds.over25 ?? 1.85,
    under25: odds.under25 ?? 1.95,
    over15: odds.over15 ?? 1.3,
    under15: odds.under15 ?? 3.5,
    over35: odds.over35 ?? 2.5,
    under35: odds.under35 ?? 1.5,
    btts_yes: odds.btts_yes ?? 1.8,
    btts_no: odds.btts_no ?? 1.95,
  };
}

// ---- Demo Data ----

function generateDemoTeamStats(): TeamStats {
  const played = 28 + Math.floor(Math.random() * 10);
  const wins = Math.floor(played * (0.35 + Math.random() * 0.3));
  const draws = Math.floor((played - wins) * (0.3 + Math.random() * 0.2));
  const losses = played - wins - draws;
  const goalsFor = Math.floor(played * (1.1 + Math.random() * 0.8));
  const goalsAgainst = Math.floor(played * (0.8 + Math.random() * 0.7));

  const form: Array<"W" | "D" | "L"> = [];
  for (let i = 0; i < 5; i++) {
    const r = Math.random();
    if (r < 0.45) form.push("W");
    else if (r < 0.7) form.push("D");
    else form.push("L");
  }

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    cleanSheets: Math.floor(played * 0.3),
    bttsCount: Math.floor(played * 0.55),
    over25Count: Math.floor(played * 0.52),
    over15Count: Math.floor(played * 0.72),
    over35Count: Math.floor(played * 0.28),
    avgGoalsScored: goalsFor / played,
    avgGoalsConceded: goalsAgainst / played,
    homeWins: Math.floor(wins * 0.6),
    homePlayed: Math.floor(played / 2),
    awayWins: Math.floor(wins * 0.4),
    awayPlayed: Math.ceil(played / 2),
    form,
    lastMatches: [],
  };
}

function getDemoH2H(): PastMatch[] {
  return [
    { date: "2024-12-15", homeTeam: "Galatasaray", awayTeam: "Fenerbahce", homeScore: 3, awayScore: 1, league: "Super Lig" },
    { date: "2024-04-20", homeTeam: "Fenerbahce", awayTeam: "Galatasaray", homeScore: 0, awayScore: 0, league: "Super Lig" },
    { date: "2023-12-10", homeTeam: "Galatasaray", awayTeam: "Fenerbahce", homeScore: 2, awayScore: 1, league: "Super Lig" },
    { date: "2023-06-04", homeTeam: "Fenerbahce", awayTeam: "Galatasaray", homeScore: 1, awayScore: 0, league: "Super Lig" },
    { date: "2023-01-08", homeTeam: "Galatasaray", awayTeam: "Fenerbahce", homeScore: 0, awayScore: 1, league: "Super Lig" },
  ];
}

export function getDemoMatches(): Match[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: "demo-1",
      homeTeam: { id: "t1", name: "Galatasaray", logo: "" },
      awayTeam: { id: "t2", name: "Fenerbahce", logo: "" },
      league: "Super Lig",
      leagueCountry: "Turkiye",
      date: today,
      time: "20:00",
      status: "scheduled",
      odds: { home: 1.85, draw: 3.4, away: 4.2, over25: 1.75, under25: 2.05, over15: 1.25, under15: 3.8, over35: 2.6, under35: 1.45, btts_yes: 1.7, btts_no: 2.1 },
    },
    {
      id: "demo-2",
      homeTeam: { id: "t3", name: "Besiktas", logo: "" },
      awayTeam: { id: "t4", name: "Trabzonspor", logo: "" },
      league: "Super Lig",
      leagueCountry: "Turkiye",
      date: today,
      time: "17:00",
      status: "live",
      homeScore: 1,
      awayScore: 0,
      minute: 34,
      odds: { home: 1.65, draw: 3.6, away: 5.5, over25: 1.85, under25: 1.95, over15: 1.2, under15: 4.2, over35: 2.8, under35: 1.4, btts_yes: 1.75, btts_no: 2.0 },
    },
    {
      id: "demo-3",
      homeTeam: { id: "t5", name: "Real Madrid", logo: "" },
      awayTeam: { id: "t6", name: "Barcelona", logo: "" },
      league: "La Liga",
      leagueCountry: "Ispanya",
      date: today,
      time: "22:00",
      status: "scheduled",
      odds: { home: 2.1, draw: 3.3, away: 3.2, over25: 1.65, under25: 2.2, over15: 1.15, under15: 5.0, over35: 2.3, under35: 1.55, btts_yes: 1.6, btts_no: 2.25 },
    },
    {
      id: "demo-4",
      homeTeam: { id: "t7", name: "Manchester City", logo: "" },
      awayTeam: { id: "t8", name: "Liverpool", logo: "" },
      league: "Premier League",
      leagueCountry: "Ingiltere",
      date: today,
      time: "18:30",
      status: "live",
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      odds: { home: 1.9, draw: 3.5, away: 3.8, over25: 1.55, under25: 2.4, over15: 1.1, under15: 6.0, over35: 2.0, under35: 1.75, btts_yes: 1.55, btts_no: 2.35 },
    },
    {
      id: "demo-5",
      homeTeam: { id: "t9", name: "Bayern Munchen", logo: "" },
      awayTeam: { id: "t10", name: "Borussia Dortmund", logo: "" },
      league: "Bundesliga",
      leagueCountry: "Almanya",
      date: today,
      time: "19:30",
      status: "scheduled",
      odds: { home: 1.5, draw: 4.2, away: 6.0, over25: 1.45, under25: 2.7, over15: 1.08, under15: 7.0, over35: 1.9, under35: 1.85, btts_yes: 1.65, btts_no: 2.15 },
    },
    {
      id: "demo-6",
      homeTeam: { id: "t11", name: "PSG", logo: "" },
      awayTeam: { id: "t12", name: "Marseille", logo: "" },
      league: "Ligue 1",
      leagueCountry: "Fransa",
      date: today,
      time: "21:00",
      status: "scheduled",
      odds: { home: 1.4, draw: 4.5, away: 7.5, over25: 1.55, under25: 2.4, over15: 1.12, under15: 5.5, over35: 2.1, under35: 1.7, btts_yes: 1.8, btts_no: 1.95 },
    },
    {
      id: "demo-7",
      homeTeam: { id: "t13", name: "Juventus", logo: "" },
      awayTeam: { id: "t14", name: "Inter Milano", logo: "" },
      league: "Serie A",
      leagueCountry: "Italya",
      date: today,
      time: "20:45",
      status: "scheduled",
      odds: { home: 2.5, draw: 3.1, away: 2.8, over25: 1.9, under25: 1.9, over15: 1.28, under15: 3.5, over35: 2.7, under35: 1.42, btts_yes: 1.72, btts_no: 2.05 },
    },
    {
      id: "demo-8",
      homeTeam: { id: "t15", name: "Basaksehir", logo: "" },
      awayTeam: { id: "t16", name: "Antalyaspor", logo: "" },
      league: "Super Lig",
      leagueCountry: "Turkiye",
      date: today,
      time: "16:00",
      status: "finished",
      homeScore: 2,
      awayScore: 1,
      odds: { home: 1.7, draw: 3.5, away: 5.0, over25: 1.8, under25: 2.0, over15: 1.22, under15: 4.0, over35: 2.5, under35: 1.5, btts_yes: 1.75, btts_no: 2.0 },
    },
    {
      id: "demo-9",
      homeTeam: { id: "t17", name: "Ajax", logo: "" },
      awayTeam: { id: "t18", name: "PSV Eindhoven", logo: "" },
      league: "Eredivisie",
      leagueCountry: "Hollanda",
      date: today,
      time: "19:00",
      status: "halftime",
      homeScore: 0,
      awayScore: 1,
      minute: 45,
      odds: { home: 2.2, draw: 3.4, away: 3.1, over25: 1.6, under25: 2.3, over15: 1.18, under15: 4.5, over35: 2.2, under35: 1.6, btts_yes: 1.58, btts_no: 2.3 },
    },
    {
      id: "demo-10",
      homeTeam: { id: "t19", name: "Atletico Madrid", logo: "" },
      awayTeam: { id: "t20", name: "Sevilla", logo: "" },
      league: "La Liga",
      leagueCountry: "Ispanya",
      date: today,
      time: "17:15",
      status: "live",
      homeScore: 1,
      awayScore: 1,
      minute: 55,
      odds: { home: 1.6, draw: 3.8, away: 5.5, over25: 1.95, under25: 1.85, over15: 1.15, under15: 5.0, over35: 3.0, under35: 1.35, btts_yes: 1.65, btts_no: 2.15 },
    },
  ];
}
