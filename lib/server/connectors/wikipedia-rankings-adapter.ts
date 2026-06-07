const MEDIAWIKI_BASE = "https://en.wikipedia.org/w/api.php";
const FIFA_RANKINGS_PAGE = "FIFA Men's World Ranking";

export type RankingRecord = {
  teamName: string;
  elo: number;
  attack: number;
  defense: number;
  formScore: number;
  injuryImpact: number;
  scheduleLoad: number;
  rank: number;
  source: "wikipedia-fifa";
};

type WikiParseResponse = {
  parse?: {
    wikitext?: {
      "*": string;
    };
  };
};

function parseTableRows(wikitext: string): Array<{ rank: number; team: string; points: number }> {
  const lines = wikitext.split("\n");
  const rows: Array<{ rank: number; team: string; points: number }> = [];
  let inRankingsTable = false;

  for (const line of lines) {
    if (line.includes("|rk") && line.includes("|team")) {
      inRankingsTable = true;
      continue;
    }
    if (!inRankingsTable) continue;
    if (line.startsWith("|}|")) {
      inRankingsTable = false;
      continue;
    }

    const cells = line.split("||").map((c) => c.replace(/^\|/u, "").replace(/\|$/u, "").trim());
    if (cells.length < 3) continue;
    if (cells[0].startsWith("|-")) continue;
    if (cells[0].startsWith("!")) continue;

    const rank = Number(cells[0].replace(/\[|\]|#/gu, "").trim());
    const team = cells[1].replace(/\[\[|\]\]|'''?/gu, "").split("|").pop()?.trim() ?? cells[1].trim();
    const points = Number(cells[2].replace(/[^\d.]/gu, ""));

    if (!Number.isNaN(rank) && team && !Number.isNaN(points)) {
      rows.push({ rank, team, points });
    }
  }

  return rows.slice(0, 50);
}

function estimateStrengths(points: number, top: number) {
  const ratio = points / top;
  const elo = 1500 + (ratio - 0.5) * 1000;
  const attack = 60 + ratio * 30;
  const defense = 60 + ratio * 30;
  return {
    elo: Math.round(elo),
    attack: Math.round(attack * 10) / 10,
    defense: Math.round(defense * 10) / 10
  };
}

export class WikipediaRankingAdapter {
  sourceId = "wikipedia-rankings";

  async fetchRankings(): Promise<RankingRecord[]> {
    const url = new URL(MEDIAWIKI_BASE);
    url.searchParams.set("action", "parse");
    url.searchParams.set("page", FIFA_RANKINGS_PAGE);
    url.searchParams.set("prop", "wikitext");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "FootballIntelligencePlatform/0.1 (https://github.com/JiangLai999/football-intelligence-platform)"
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Wikipedia request failed: ${response.status}`);
    }

    const data = (await response.json()) as WikiParseResponse;
    const wikitext = data.parse?.wikitext?.["*"];

    if (!wikitext) {
      throw new Error("Wikipedia page returned empty wikitext");
    }

    const rows = parseTableRows(wikitext);
    if (rows.length === 0) {
      throw new Error("Could not parse FIFA ranking table from Wikipedia response");
    }

    const topPoints = rows[0]?.points ?? 2000;

    return rows.map((row, index) => {
      const strength = estimateStrengths(row.points, topPoints);
      return {
        teamName: row.team,
        ...strength,
        formScore: 0.5 + (0.5 - index / rows.length) * 0.4,
        injuryImpact: 0.05,
        scheduleLoad: 0.4,
        rank: row.rank,
        source: "wikipedia-fifa" as const
      };
    });
  }
}
