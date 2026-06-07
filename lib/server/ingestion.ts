import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { fetchFixtures, fetchLineups, fetchNews, fetchOdds, fetchRankings, getSourceHealth } from "@/lib/server/channel-router";
import { DemoFixtureAdapter } from "@/lib/server/connectors/fixtures-adapter";
import { DemoOddsAdapter } from "@/lib/server/connectors/odds-adapter";
import { DemoLineupAdapter } from "@/lib/server/connectors/lineups-adapter";
import { DemoRankingAdapter } from "@/lib/server/connectors/rankings-adapter";
import { DemoNewsAdapter } from "@/lib/server/connectors/news-adapter";

type IngestionResult = {
  name: string;
  channel: string;
  processed: number;
  written: number;
  skipped: number;
  status: string;
};

export async function ingestDemoFixtures(): Promise<IngestionResult> {
  const result = await fetchFixtures();
  const adapter = new DemoFixtureAdapter();
  const name = `${adapter.sourceId}|${result.channel}`;
  const records = result.records;

  if (!hasDatabaseUrl()) {
    return {
      name,
      channel: result.channel,
      processed: records.length,
      written: 0,
      skipped: records.length,
      status: "dry-run"
    };
  }

  let written = 0;
  let skipped = 0;

  for (const fixture of records) {
    const competition = await prisma.competition.findFirst({ where: { name: fixture.competition } });
    const season = competition
      ? await prisma.season.findFirst({ where: { name: String(fixture.season), competitionId: competition.id } })
      : null;
    const homeTeam = await prisma.team.findFirst({ where: { name: fixture.homeTeam } });
    const awayTeam = await prisma.team.findFirst({ where: { name: fixture.awayTeam } });

    if (!competition || !season || !homeTeam || !awayTeam) {
      skipped += 1;
      continue;
    }

    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      update: {
        venue: fixture.venue,
        kickoffAt: new Date(fixture.kickoffAt),
        status: fixture.status as never
      },
      create: {
        externalId: fixture.externalId,
        seasonId: season.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        venue: fixture.venue,
        roundName: "Imported Fixture",
        kickoffAt: new Date(fixture.kickoffAt),
        status: fixture.status as never
      }
    });
    written += 1;
  }

  return {
    name,
    channel: result.channel,
    processed: records.length,
    written,
    skipped,
    status: "completed"
  };
}

export async function ingestDemoOdds(): Promise<IngestionResult> {
  const result = await fetchOdds();
  const adapter = new DemoOddsAdapter();
  const name = `${adapter.sourceId}|${result.channel}`;
  const records = result.records;

  if (!hasDatabaseUrl()) {
    return {
      name,
      channel: result.channel,
      processed: records.length,
      written: 0,
      skipped: records.length,
      status: "dry-run"
    };
  }

  let written = 0;
  let skipped = 0;

  for (const record of records) {
    const match = await prisma.match.findFirst({
      where: { externalId: { startsWith: record.externalMatchId.split("-").slice(0, 2).join("-") } }
    }).catch(() => null);

    let resolvedMatch = match;
    if (!resolvedMatch) {
      const stripped = record.externalMatchId.replace(/^odds-/, "").replace(/-[a-z0-9]+$/i, "");
      resolvedMatch = await prisma.match.findFirst({ where: { externalId: stripped } });
    }

    const source = await prisma.oddsSource.findFirst({ where: { name: record.source } });

    if (!resolvedMatch || !source) {
      skipped += 1;
      continue;
    }

    await prisma.oddsSnapshot.create({
      data: {
        matchId: resolvedMatch.id,
        sourceId: source.id,
        marketType: record.marketType as never,
        line: record.line,
        homeOdds: record.homeOdds,
        drawOdds: record.drawOdds,
        awayOdds: record.awayOdds,
        impliedHome: record.homeOdds ? 1 / record.homeOdds : null,
        impliedDraw: record.drawOdds ? 1 / record.drawOdds : null,
        impliedAway: record.awayOdds ? 1 / record.awayOdds : null,
        recordedAt: new Date(record.recordedAt)
      }
    });
    written += 1;
  }

  return {
    name,
    channel: result.channel,
    processed: records.length,
    written,
    skipped,
    status: "completed"
  };
}

export async function ingestDemoLineups(): Promise<IngestionResult> {
  const result = await fetchLineups();
  const adapter = new DemoLineupAdapter();
  const name = `${adapter.sourceId}|${result.channel}`;
  const records = result.records;

  if (!hasDatabaseUrl()) {
    return {
      name,
      channel: result.channel,
      processed: records.length,
      written: 0,
      skipped: records.length,
      status: "dry-run"
    };
  }

  let written = 0;
  let skipped = 0;

  for (const record of records) {
    const match = await prisma.match.findFirst({ where: { externalId: record.externalMatchId } });
    const team = await prisma.team.findFirst({ where: { name: record.teamName } });

    if (!match || !team) {
      skipped += 1;
      continue;
    }

    await prisma.lineup.upsert({
      where: { id: `${match.id}-${team.id}` },
      update: {
        formation: record.formation,
        confirmed: record.confirmed,
        snapshot: record.players
      },
      create: {
        id: `${match.id}-${team.id}`,
        matchId: match.id,
        teamId: team.id,
        formation: record.formation,
        confirmed: record.confirmed,
        snapshot: record.players
      }
    });
    written += 1;
  }

  return {
    name,
    channel: result.channel,
    processed: records.length,
    written,
    skipped,
    status: "completed"
  };
}

export async function ingestDemoRankings(): Promise<IngestionResult> {
  const result = await fetchRankings();
  const adapter = new DemoRankingAdapter();
  const name = `${adapter.sourceId}|${result.channel}`;
  const records = result.records;

  if (!hasDatabaseUrl()) {
    return {
      name,
      channel: result.channel,
      processed: records.length,
      written: 0,
      skipped: records.length,
      status: "dry-run"
    };
  }

  let written = 0;
  let skipped = 0;
  const now = new Date();

  for (const record of records) {
    const team = await prisma.team.findFirst({ where: { name: record.teamName } });

    if (!team) {
      skipped += 1;
      continue;
    }

    await prisma.team.update({
      where: { id: team.id },
      data: {
        ratingOverall: record.elo,
        ratingAttack: record.attack,
        ratingDefense: record.defense
      }
    });

    await prisma.teamRatingSnapshot.create({
      data: {
        teamId: team.id,
        capturedAt: now,
        elo: record.elo,
        attack: record.attack,
        defense: record.defense,
        formScore: record.formScore,
        injuryImpact: record.injuryImpact,
        scheduleLoad: record.scheduleLoad
      }
    });
    written += 1;
  }

  return {
    name,
    channel: result.channel,
    processed: records.length,
    written,
    skipped,
    status: "completed"
  };
}

export async function ingestDemoNews(): Promise<IngestionResult> {
  const result = await fetchNews();
  const adapter = new DemoNewsAdapter();
  const name = `${adapter.sourceId}|${result.channel}`;
  const records = result.records;

  if (!hasDatabaseUrl()) {
    return {
      name,
      channel: result.channel,
      processed: records.length,
      written: 0,
      skipped: records.length,
      status: "dry-run"
    };
  }

  let written = 0;
  let skipped = 0;

  for (const item of records) {
    const team = await prisma.team.findFirst({ where: { name: item.teamName } });

    if (!team) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.alert.findFirst({
      where: { category: "news-external" },
      orderBy: { createdAt: "desc" }
    });

    if (existing) {
      const lastExternalId = (existing.metadata as Record<string, string>)?.externalId;
      if (lastExternalId === item.externalId) {
        skipped += 1;
        continue;
      }
    }

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
        status: "SCHEDULED"
      },
      orderBy: { kickoffAt: "asc" }
    });

    if (!match) {
      skipped += 1;
      continue;
    }

    await prisma.alert.create({
      data: {
        matchId: match.id,
        severity: item.category === "injury" ? "HIGH" : "MEDIUM",
        category: "news-external",
        message: item.headline,
        metadata: {
          externalId: item.externalId,
          body: item.body,
          publishedAt: item.publishedAt,
          team: item.teamName,
          source: item.source,
          url: item.url
        }
      }
    });
    written += 1;
  }

  return {
    name,
    channel: result.channel,
    processed: records.length,
    written,
    skipped,
    status: "completed"
  };
}

export async function getDemoIngestionRuns() {
  const [fixtures, odds, lineups, rankings, news] = await Promise.all([
    ingestDemoFixtures(),
    ingestDemoOdds(),
    ingestDemoLineups(),
    ingestDemoRankings(),
    ingestDemoNews()
  ]);
  return { runs: [fixtures, odds, lineups, rankings, news], health: await getSourceHealth() };
}
