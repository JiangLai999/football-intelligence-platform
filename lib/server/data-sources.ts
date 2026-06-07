import type { DataSourceDescriptor } from "@/lib/types";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const dataSources: DataSourceDescriptor[] = [
  {
    id: "fixtures-primary",
    label: "Primary fixtures feed",
    category: "fixtures",
    mode: "api",
    cadence: "15m pre-match / 30s in-play",
    status: "planned",
    notes: "Canonical fixtures, scores, competition metadata and venues.",
    enabled: true
  },
  {
    id: "odds-aggregator",
    label: "Odds aggregator",
    category: "odds",
    mode: "api",
    cadence: "5m pre-match / 15s in-play",
    status: "planned",
    notes: "1X2, Asian handicap, totals and source-level divergence snapshots.",
    enabled: true
  },
  {
    id: "lineups-scraper",
    label: "Lineup monitor",
    category: "lineups",
    mode: "scraper",
    cadence: "60m to kickoff / 5m final hour",
    status: "active",
    notes: "Official lineups, late scratches and formation confirmations.",
    enabled: true
  },
  {
    id: "ratings-provider",
    label: "Ratings and rankings provider",
    category: "rankings",
    mode: "manual",
    cadence: "Daily",
    status: "fallback",
    notes: "External Elo/FIFA baselines used when proprietary ratings are stale.",
    enabled: true
  },
  {
    id: "news-monitor",
    label: "News and press conference monitor",
    category: "news",
    mode: "scraper",
    cadence: "30m",
    status: "planned",
    notes: "Context feed for injuries, tactical hints and manager comments.",
    enabled: true
  }
];

export function getDataSources() {
  return dataSources;
}

export async function getPersistedOrFallbackSources() {
  if (!hasDatabaseUrl()) {
    return dataSources;
  }

  try {
    const rows = await prisma.feedSourceConfig.findMany({ orderBy: { createdAt: "asc" } });
    if (!rows.length) return dataSources;
    return rows.map((row) => ({
      id: row.code,
      label: row.label,
      category: row.category as DataSourceDescriptor["category"],
      mode: row.mode as DataSourceDescriptor["mode"],
      cadence: row.cadence,
      status: row.status.toLowerCase() as DataSourceDescriptor["status"],
      notes: row.notes ?? "",
      enabled: row.enabled
    }));
  } catch {
    return dataSources;
  }
}
