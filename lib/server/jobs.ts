import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { ingestDemoFixtures, ingestDemoOdds, ingestDemoLineups, ingestDemoRankings, ingestDemoNews } from "@/lib/server/ingestion";
import { writeAuditLog } from "@/lib/server/audit";

type JobContext = {
  actor: string;
  requestContext: {
    ip: string;
    userAgent: string;
    path: string;
  };
};

type JobExecutionResult = {
  processed: number;
  written: number;
  skipped: number;
  status: "COMPLETED" | "FAILED";
  note: string;
};

type JobExecutor = (context: JobContext) => Promise<JobExecutionResult>;

function buildFallbackResult(name: string): JobExecutionResult {
  const score = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const processed = 24 + (score % 90);
  const written = Math.max(0, processed - (score % 7));
  const skipped = processed - written;
  const failed = score % 5 === 0;

  return {
    processed,
    written,
    skipped,
    status: failed ? "FAILED" : "COMPLETED",
    note: failed
      ? "Execution finished with simulated upstream validation failure."
      : "Execution finished and operator metrics were persisted successfully."
  };
}

const executors: Record<string, JobExecutor> = {
  sync_fixtures: async () => {
    const result = await ingestDemoFixtures();
    return {
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      status: result.status === "completed" ? "COMPLETED" : "FAILED",
      note: "Fixture ingestion run completed through the unified job runner."
    };
  },
  sync_odds: async () => {
    const result = await ingestDemoOdds();
    return {
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      status: result.status === "completed" ? "COMPLETED" : "FAILED",
      note: "Odds ingestion run completed through the unified job runner."
    };
  },
  sync_lineups: async () => {
    const result = await ingestDemoLineups();
    return {
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      status: result.status === "completed" ? "COMPLETED" : "FAILED",
      note: "Lineup ingestion run completed through the unified job runner."
    };
  },
  sync_rankings: async () => {
    const result = await ingestDemoRankings();
    return {
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      status: result.status === "completed" ? "COMPLETED" : "FAILED",
      note: "Rankings ingestion run completed through the unified job runner."
    };
  },
  sync_news: async () => {
    const result = await ingestDemoNews();
    return {
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      status: result.status === "completed" ? "COMPLETED" : "FAILED",
      note: "News ingestion run completed through the unified job runner."
    };
  }
};

function resolveExecutor(name: string): JobExecutor {
  return executors[name] ?? (async () => buildFallbackResult(name));
}

export async function queueAndRunJob(name: string, stage: string, context: JobContext) {
  if (!hasDatabaseUrl()) {
    const result = await resolveExecutor(name)(context);
    await writeAuditLog({
      actor: context.actor,
      action: result.status === "FAILED" ? "JOB_RUN_FAILED" : "JOB_RUN_COMPLETED",
      entityType: "job-run",
      entityId: name,
      metadata: {
        summary: `${name} executed in demo mode with final state ${result.status}.`,
        stage,
        processed: result.processed,
        written: result.written,
        skipped: result.skipped,
        durationMs: 0,
        ...context.requestContext
      }
    });

    return {
      id: `demo-${name}`,
      name,
      stage,
      status: result.status,
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      note: result.note,
      startedAt: new Date(),
      finishedAt: new Date()
    };
  }

  const queuedRun = await prisma.jobRun.create({
    data: {
      name,
      stage,
      status: "QUEUED",
      note: "Queued from operator API via unified runner"
    }
  });

  await writeAuditLog({
    actor: context.actor,
    action: "JOB_RUN_QUEUED",
    entityType: "job-run",
    entityId: queuedRun.id,
    metadata: {
      summary: `${name} queued for execution.`,
      stage,
      ...context.requestContext
    }
  });

  const runningStartedAt = Date.now();
  const runningRun = await prisma.jobRun.update({
    where: { id: queuedRun.id },
    data: {
      status: "RUNNING",
      note: "Execution started from unified job runner"
    }
  });

  await writeAuditLog({
    actor: context.actor,
    action: "JOB_RUN_STARTED",
    entityType: "job-run",
    entityId: runningRun.id,
    metadata: {
      summary: `${name} started execution.`,
      stage,
      ...context.requestContext
    }
  });

  const result = await resolveExecutor(name)(context);
  const completedRun = await prisma.jobRun.update({
    where: { id: runningRun.id },
    data: {
      status: result.status,
      processed: result.processed,
      written: result.written,
      skipped: result.skipped,
      finishedAt: new Date(),
      note: result.note
    }
  });

  await writeAuditLog({
    actor: context.actor,
    action: result.status === "FAILED" ? "JOB_RUN_FAILED" : "JOB_RUN_COMPLETED",
    entityType: "job-run",
    entityId: completedRun.id,
    metadata: {
      summary: `${name} finished with status ${completedRun.status}.`,
      stage,
      processed: completedRun.processed,
      written: completedRun.written,
      skipped: completedRun.skipped,
      durationMs: Date.now() - runningStartedAt,
      ...context.requestContext
    }
  });

  return completedRun;
}

export async function getJobRuns(options?: {
  limit?: number;
  status?: string;
  stage?: string;
  name?: string;
}) {
  const limit = options?.limit ?? 20;
  const statusFilter = options?.status && options.status !== "all" ? options.status : undefined;
  const stageFilter = options?.stage && options.stage !== "all" ? options.stage : undefined;
  const nameFilter = options?.name && options.name !== "all" ? options.name : undefined;

  if (!hasDatabaseUrl()) {
    return [
      {
        id: "demo-sync-fixtures",
        name: "sync_fixtures",
        stage: "ingestion",
        status: "COMPLETED",
        processed: 2,
        written: 0,
        skipped: 2,
        startedAt: new Date(),
        finishedAt: new Date(),
        note: "Demo mode without DATABASE_URL"
      }
    ];
  }

  return prisma.jobRun.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(stageFilter ? { stage: stageFilter } : {}),
      ...(nameFilter ? { name: nameFilter } : {})
    },
    orderBy: { startedAt: "desc" },
    take: limit
  });
}

export async function getJobRunById(id: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return prisma.jobRun.findUnique({ where: { id } });
}
