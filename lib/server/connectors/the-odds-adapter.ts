const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

export type OddsRecord = {
  externalMatchId: string;
  source: string;
  marketType: string;
  line: string | null;
  homeOdds: number | null;
  drawOdds: number | null;
  awayOdds: number | null;
  recordedAt: string;
};

type TheOddsResponse = Array<{
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}>;

function readApiKey(): string {
  const key = process.env.THE_ODDS_API_KEY;
  if (!key) {
    throw new Error("THE_ODDS_API_KEY is not configured. Set it in Vercel Environment Variables.");
  }
  return key;
}

const SUPPORTED_SPORTS = [
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_spain_la_liga",
  "soccer_germany_bundesliga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one"
];

const SUPPORTED_BOOKMAKERS = ["bet365", "pinnacle", "betfair", "williamhill", "draftkings", "fanduel"];

export class TheOddsAdapter {
  sourceId = "the-odds-api";

  async fetchOdds(options: { sport?: string; regions?: string } = {}): Promise<OddsRecord[]> {
    const regions = options.regions ?? "uk,eu,us";
    const sportsToFetch = options.sport ? [options.sport] : SUPPORTED_SPORTS;

    const allOdds: OddsRecord[] = [];

    for (const sport of sportsToFetch) {
      const url = new URL(`${ODDS_API_BASE}/sports/${sport}/odds`);
      url.searchParams.set("apiKey", readApiKey());
      url.searchParams.set("regions", regions);
      url.searchParams.set("markets", "h2h");
      url.searchParams.set("oddsFormat", "decimal");
      url.searchParams.set("bookmakers", SUPPORTED_BOOKMAKERS.join(","));

      const response = await fetch(url.toString(), {
        next: { revalidate: 180 }
      });

      if (!response.ok) {
        console.warn(`[TheOddsAdapter] ${sport} failed: ${response.status}`);
        continue;
      }

      const data = (await response.json()) as TheOddsResponse;
      for (const event of data) {
        for (const bookmaker of event.bookmakers) {
          const h2h = bookmaker.markets.find((market) => market.key === "h2h");
          if (!h2h) continue;

          const homeOutcome = h2h.outcomes.find((outcome) => outcome.name === event.home_team);
          const drawOutcome = h2h.outcomes.find((outcome) => outcome.name === "Draw");
          const awayOutcome = h2h.outcomes.find((outcome) => outcome.name === event.away_team);

          allOdds.push({
            externalMatchId: `odds-${event.id}-${bookmaker.key}`,
            source: bookmaker.title,
            marketType: "ONE_X_TWO",
            line: null,
            homeOdds: homeOutcome?.price ?? null,
            drawOdds: drawOutcome?.price ?? null,
            awayOdds: awayOutcome?.price ?? null,
            recordedAt: h2h.last_update ?? new Date().toISOString()
          });
        }
      }
    }

    return allOdds;
  }
}
