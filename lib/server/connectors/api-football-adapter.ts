const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

export type ApiFootballFixture = {
  externalId: string;
  competition: string;
  season: number;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  venue: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  leagueId: number;
};

export type ApiFootballLineupEntry = {
  externalMatchId: string;
  teamName: string;
  formation: string;
  confirmed: boolean;
  players: { name: string; position: string; shirtNumber?: number }[];
};

export type ApiFootballInjury = {
  teamName: string;
  playerName: string;
  type: string;
  reason: string;
};

type ApiFootballFixtureResponse = {
  response: Array<{
    fixture: {
      id: number;
      date: string;
      status: { short: string; long: string };
      venue: { name: string | null } | null;
    };
    league: { id: number; name: string; season: number; country: string };
    teams: {
      home: { name: string; logo: string | null };
      away: { name: string; logo: string | null };
    };
    goals: { home: number | null; away: number | null };
  }>;
};

type ApiFootballLineupResponse = {
  response: Array<{
    team: { name: string };
    formation: string;
    startXI: Array<{ player: { name: string; number: number; pos: string } }>;
    substitutes: Array<{ player: { name: string; number: number; pos: string } }>;
  }> | null;
};

type ApiFootballInjuriesResponse = {
  response: Array<{
    player: { name: string; type: string; reason: string };
    team: { name: string };
  }>;
};

function readApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error("API_FOOTBALL_KEY is not configured. Set it in Vercel Environment Variables.");
  }
  return key;
}

async function apiFetch<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_FOOTBALL_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": readApiKey()
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export class ApiFootballFixtureAdapter {
  sourceId = "api-football-fixtures";

  async fetchFixtures(options: { date?: string; next?: number; leagueId?: number } = {}): Promise<ApiFootballFixture[]> {
    const params: Record<string, string | number> = {};
    if (options.date) params.date = options.date;
    if (options.next) params.next = options.next;
    if (options.leagueId) params.league = options.leagueId;

    const data = await apiFetch<ApiFootballFixtureResponse>("/fixtures", params);

    return data.response.map((item) => ({
      externalId: `apif-${item.fixture.id}`,
      competition: item.league.name,
      season: item.league.season,
      homeTeam: item.teams.home.name,
      awayTeam: item.teams.away.name,
      kickoffAt: item.fixture.date,
      venue: item.fixture.venue?.name ?? "TBD",
      status: mapStatus(item.fixture.status.short),
      homeScore: item.goals.home,
      awayScore: item.goals.away,
      leagueId: item.league.id
    }));
  }

  async fetchLineups(fixtureId: number): Promise<ApiFootballLineupEntry[]> {
    const data = await apiFetch<ApiFootballLineupResponse>("/fixtures/lineups", { fixture: fixtureId });
    if (!data.response) return [];

    return data.response.map((item) => ({
      externalMatchId: `apif-${fixtureId}`,
      teamName: item.team.name,
      formation: item.formation,
      confirmed: true,
      players: item.startXI.map((entry) => ({
        name: entry.player.name,
        position: entry.player.pos,
        shirtNumber: entry.player.number
      }))
    }));
  }

  async fetchInjuries(options: { leagueId?: number; season?: number } = {}): Promise<ApiFootballInjury[]> {
    const params: Record<string, string | number> = {};
    if (options.leagueId) params.league = options.leagueId;
    if (options.season) params.season = options.season;

    const data = await apiFetch<ApiFootballInjuriesResponse>("/injuries", params);

    return data.response.map((item) => ({
      teamName: item.team.name,
      playerName: item.player.name,
      type: item.player.type,
      reason: item.player.reason
    }));
  }
}

function mapStatus(short: string): string {
  switch (short) {
    case "NS":
    case "TBD":
      return "SCHEDULED";
    case "1H":
    case "2H":
    case "HT":
    case "ET":
    case "P":
    case "BT":
    case "LIVE":
      return "LIVE";
    case "FT":
    case "AET":
    case "PEN":
      return "FINISHED";
    case "PST":
      return "POSTPONED";
    case "CANC":
    case "ABD":
      return "CANCELED";
    default:
      return "SCHEDULED";
  }
}
