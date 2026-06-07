import { NextResponse } from "next/server";
import { ingestDemoFixtures, ingestDemoOdds, ingestDemoLineups, ingestDemoRankings, ingestDemoNews, getDemoIngestionRuns } from "@/lib/server/ingestion";
import { writeAuditLog } from "@/lib/server/audit";
import { hasOperatorSession } from "@/lib/server/auth";

type RefreshJob = "fixtures" | "odds" | "lineups" | "rankings" | "news";

const JOB_MAP: Record<RefreshJob, () => Promise<{ processed: number; written: number; skipped: number; status: string; channel: string }>> = {
  fixtures: () => ingestDemoFixtures(),
  odds: () => ingestDemoOdds(),
  lineups: () => ingestDemoLineups(),
  rankings: () => ingestDemoRankings(),
  news: () => ingestDemoNews()
};

async function verifyCronRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (process.env.CRON_REFRESH_TOKEN && token === process.env.CRON_REFRESH_TOKEN) {
      return { authorized: true as const, actor: "cron" };
    }
  }
  const session = await hasOperatorSession();
  if (session) {
    return { authorized: true as const, actor: "operator" };
  }
  return { authorized: false as const, actor: "anonymous" };
}

export async function POST(request: Request) {
  const auth = await verifyCronRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requested: RefreshJob[] = Array.isArray(body.jobs) && body.jobs.length > 0
    ? body.jobs
    : ["fixtures", "odds", "lineups", "rankings", "news"];

  const results: Record<string, { processed: number; written: number; skipped: number; status: string; channel: string }> = {};
  const errors: string[] = [];

  for (const job of requested) {
    try {
      results[job] = await JOB_MAP[job]();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${job}: ${message}`);
      results[job] = { processed: 0, written: 0, skipped: 0, status: "FAILED", channel: "error" };
    }
  }

  const health = await getDemoIngestionRuns().then((r) => r.health).catch(() => []);

  await writeAuditLog({
    actor: auth.actor,
    action: "CRON_REFRESH",
    entityType: "data-refresh",
    metadata: {
      summary: `Cron refresh executed ${requested.length} jobs via ${auth.actor}.`,
      jobs: requested,
      results,
      errors
    }
  });

  return NextResponse.json({
    success: errors.length === 0,
    actor: auth.actor,
    results,
    errors,
    sourceHealth: health,
    refreshedAt: new Date().toISOString()
  });
}

export async function GET(request: Request) {
  const auth = await verifyCronRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const health = await getDemoIngestionRuns().then((r) => r.health).catch(() => []);
  return NextResponse.json({ sourceHealth: health, checkedAt: new Date().toISOString() });
}
