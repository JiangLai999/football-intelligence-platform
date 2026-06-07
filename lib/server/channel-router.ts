import { DemoFixtureAdapter, type FixtureRecord } from "@/lib/server/connectors/fixtures-adapter";
import { DemoOddsAdapter, type OddsRecord } from "@/lib/server/connectors/odds-adapter";
import { DemoLineupAdapter, type LineupRecord } from "@/lib/server/connectors/lineups-adapter";
import { DemoRankingAdapter } from "@/lib/server/connectors/rankings-adapter";
import { DemoNewsAdapter, type NewsItem } from "@/lib/server/connectors/news-adapter";
import { ApiFootballFixtureAdapter } from "@/lib/server/connectors/api-football-adapter";
import { TheOddsAdapter } from "@/lib/server/connectors/the-odds-adapter";
import { WikipediaRankingAdapter } from "@/lib/server/connectors/wikipedia-rankings-adapter";
import { RssNewsAdapter } from "@/lib/server/connectors/rss-news-adapter";

export type Channel = "live" | "demo" | "unavailable";
export type FixtureChannel = "api-football" | "demo" | "unavailable";
export type OddsChannel = "the-odds-api" | "demo" | "unavailable";
export type RankingChannel = "wikipedia-fifa" | "demo" | "unavailable";
export type NewsChannel = "rss-aggregator" | "demo" | "unavailable";
export type LineupChannel = "api-football" | "demo" | "unavailable";

export type SourceHealth = {
  channel: string;
  configured: boolean;
  reachable: boolean;
  reason?: string;
};

const cache = new Map<string, { value: unknown; expiresAt: number }>();

async function cached<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  const value = await factory();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function isApiFootballConfigured(): boolean {
  return Boolean(process.env.API_FOOTBALL_KEY);
}

function isTheOddsConfigured(): boolean {
  return Boolean(process.env.THE_ODDS_API_KEY);
}

function getFixtureChannel(): FixtureChannel {
  return isApiFootballConfigured() ? "api-football" : "demo";
}

function getOddsChannel(): OddsChannel {
  return isTheOddsConfigured() ? "the-odds-api" : "demo";
}

function getRankingChannel(): RankingChannel {
  return "wikipedia-fifa";
}

function getNewsChannel(): NewsChannel {
  return "rss-aggregator";
}

function getLineupChannel(): LineupChannel {
  return isApiFootballConfigured() ? "api-football" : "demo";
}

export async function fetchFixtures(): Promise<{ channel: FixtureChannel; records: FixtureRecord[] }> {
  const channel = getFixtureChannel();
  if (channel === "unavailable") return { channel, records: [] };

  if (channel === "api-football") {
    try {
      const adapter = new ApiFootballFixtureAdapter();
      const records = await cached("fixtures:next", 5 * 60 * 1000, () => adapter.fetchFixtures({ next: 20 }));
      return { channel, records: records as unknown as FixtureRecord[] };
    } catch (error) {
      console.warn("[ChannelRouter] API-Football fixtures failed, falling back to demo:", error);
      const adapter = new DemoFixtureAdapter();
      return { channel: "demo", records: await adapter.fetchFixtures() };
    }
  }

  const adapter = new DemoFixtureAdapter();
  return { channel: "demo", records: await adapter.fetchFixtures() };
}

export async function fetchOdds(): Promise<{ channel: OddsChannel; records: OddsRecord[] }> {
  const channel = getOddsChannel();
  if (channel === "unavailable") return { channel, records: [] };

  if (channel === "the-odds-api") {
    try {
      const adapter = new TheOddsAdapter();
      const records = await cached("odds:all", 3 * 60 * 1000, () => adapter.fetchOdds());
      return { channel, records };
    } catch (error) {
      console.warn("[ChannelRouter] The Odds API failed, falling back to demo:", error);
      const adapter = new DemoOddsAdapter();
      return { channel: "demo", records: await adapter.fetchOdds() };
    }
  }

  const adapter = new DemoOddsAdapter();
  return { channel: "demo", records: await adapter.fetchOdds() };
}

export async function fetchLineups(): Promise<{ channel: LineupChannel; records: LineupRecord[] }> {
  const channel = getLineupChannel();
  if (channel === "unavailable") return { channel, records: [] };

  if (channel === "api-football") {
    try {
      const adapter = new ApiFootballFixtureAdapter();
      const fixtures = await adapter.fetchFixtures({ next: 10 });
      const allLineups: LineupRecord[] = [];
      for (const fixture of fixtures.slice(0, 5)) {
        const externalId = String(fixture.externalId);
        if (!externalId.startsWith("apif-")) continue;
        const fixtureId = Number(externalId.replace("apif-", ""));
        if (Number.isNaN(fixtureId)) continue;
        try {
          const lineups = await adapter.fetchLineups(fixtureId);
          allLineups.push(...(lineups as unknown as LineupRecord[]));
        } catch {
          continue;
        }
      }
      if (allLineups.length > 0) return { channel, records: allLineups };
    } catch (error) {
      console.warn("[ChannelRouter] API-Football lineups failed, falling back to demo:", error);
    }
  }

  const adapter = new DemoLineupAdapter();
  return { channel: "demo", records: await adapter.fetchLineups() };
}

export async function fetchRankings(): Promise<{ channel: RankingChannel; records: Awaited<ReturnType<DemoRankingAdapter["fetchRankings"]>> }> {
  const channel = getRankingChannel();
  if (channel === "unavailable") return { channel, records: [] };

  if (channel === "wikipedia-fifa") {
    try {
      const adapter = new WikipediaRankingAdapter();
      const records = await cached("rankings:wikipedia", 60 * 60 * 1000, () => adapter.fetchRankings());
      return { channel, records: records as unknown as Awaited<ReturnType<DemoRankingAdapter["fetchRankings"]>> };
    } catch (error) {
      console.warn("[ChannelRouter] Wikipedia rankings failed, falling back to demo:", error);
      const adapter = new DemoRankingAdapter();
      return { channel: "demo", records: await adapter.fetchRankings() };
    }
  }

  const adapter = new DemoRankingAdapter();
  return { channel: "demo", records: await adapter.fetchRankings() };
}

export async function fetchNews(): Promise<{ channel: NewsChannel; records: NewsItem[] }> {
  const channel = getNewsChannel();
  if (channel === "unavailable") return { channel, records: [] };

  if (channel === "rss-aggregator") {
    try {
      const adapter = new RssNewsAdapter();
      const records = await cached("news:rss", 10 * 60 * 1000, () => adapter.fetchNews());
      return { channel, records };
    } catch (error) {
      console.warn("[ChannelRouter] RSS news failed, falling back to demo:", error);
      const adapter = new DemoNewsAdapter();
      return { channel: "demo", records: await adapter.fetchNews() };
    }
  }

  const adapter = new DemoNewsAdapter();
  return { channel: "demo", records: await adapter.fetchNews() };
}

export async function getSourceHealth(): Promise<SourceHealth[]> {
  return [
    {
      channel: "api-football",
      configured: isApiFootballConfigured(),
      reachable: isApiFootballConfigured(),
      reason: isApiFootballConfigured() ? "API_FOOTBALL_KEY set" : "API_FOOTBALL_KEY missing"
    },
    {
      channel: "the-odds-api",
      configured: isTheOddsConfigured(),
      reachable: isTheOddsConfigured(),
      reason: isTheOddsConfigured() ? "THE_ODDS_API_KEY set" : "THE_ODDS_API_KEY missing"
    },
    {
      channel: "wikipedia-fifa",
      configured: true,
      reachable: true,
      reason: "Public MediaWiki API, no key required"
    },
    {
      channel: "rss-aggregator",
      configured: true,
      reachable: true,
      reason: "Public RSS feeds (BBC / Sky / ESPN), no key required"
    }
  ];
}
