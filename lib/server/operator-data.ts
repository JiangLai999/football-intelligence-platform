import { getPersistedOrFallbackSources } from "@/lib/server/data-sources";
import { getDemoIngestionRuns } from "@/lib/server/ingestion";
import { getOddsAlerts } from "@/lib/server/platform-data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import type { OperatorOverview } from "@/lib/types";

function readMetadataString(metadata: unknown, key: string, fallback = "unknown") {
  if (typeof metadata !== "object" || !metadata || !(key in metadata)) {
    return fallback;
  }

  return String(metadata[key as keyof typeof metadata]);
}

export async function getOperatorOverview(filters?: {
  actor?: string;
  action?: string;
  entityType?: string;
  taskCategory?: string;
  taskStatus?: string;
  alertSeverity?: string;
  alertState?: string;
  runStatus?: string;
  runStage?: string;
  runName?: string;
}): Promise<OperatorOverview> {
  const actorFilter = filters?.actor && filters.actor !== "all" ? filters.actor : undefined;
  const actionFilter = filters?.action && filters.action !== "all" ? filters.action : undefined;
  const entityTypeFilter = filters?.entityType && filters.entityType !== "all" ? filters.entityType : undefined;
  const taskCategoryFilter = filters?.taskCategory && filters.taskCategory !== "all" ? filters.taskCategory : undefined;
  const taskStatusFilter = filters?.taskStatus && filters.taskStatus !== "all" ? filters.taskStatus : undefined;
  const alertSeverityFilter = filters?.alertSeverity && filters.alertSeverity !== "all" ? filters.alertSeverity : undefined;
  const alertStateFilter = filters?.alertState && filters.alertState !== "all" ? filters.alertState : undefined;
  const runStatusFilter = filters?.runStatus && filters.runStatus !== "all" ? filters.runStatus : undefined;
  const runStageFilter = filters?.runStage && filters.runStage !== "all" ? filters.runStage : undefined;
  const runNameFilter = filters?.runName && filters.runName !== "all" ? filters.runName : undefined;

  const [sources, alerts, fallbackIngestionRuns, jobRuns, auditLogs] = await Promise.all([
    getPersistedOrFallbackSources(),
    getOddsAlerts(),
    getDemoIngestionRuns(),
    hasDatabaseUrl()
      ? prisma.jobRun.findMany({
          orderBy: { startedAt: "desc" },
          take: 24
        })
      : Promise.resolve([]),
    hasDatabaseUrl()
      ? prisma.auditLog.findMany({
          where: {
            ...(actorFilter ? { actor: actorFilter } : {}),
            ...(actionFilter ? { action: actionFilter } : {}),
            ...(entityTypeFilter ? { entityType: entityTypeFilter } : {})
          },
          orderBy: { createdAt: "desc" },
          take: 12
        })
      : Promise.resolve([])
  ]);

  const latestJobByName = new Map<string, (typeof jobRuns)[number]>();
  for (const run of jobRuns) {
    if (!latestJobByName.has(run.name)) {
      latestJobByName.set(run.name, run);
    }
  }

  const tasks = sources.map((source) => {
    const taskName = `sync_${source.category}`;
    const latestRun = latestJobByName.get(taskName);
    const derivedStatus =
      latestRun?.status === "FAILED"
        ? "degraded"
        : latestRun?.status === "RUNNING"
          ? "running"
          : latestRun?.status === "COMPLETED"
            ? "healthy"
            : source.status === "active"
              ? "healthy"
              : source.status === "planned"
                ? "planned"
                : "fallback";

    return {
      name: taskName,
      stage: source.category === "odds" || source.category === "fixtures" || source.category === "lineups" ? "ingestion" : "processing",
      category: source.category,
      status: derivedStatus,
      cadence: source.cadence,
      note: latestRun?.note ?? source.notes,
      actionLabel:
        latestRun?.status === "FAILED"
          ? "rerun"
          : source.status === "planned"
            ? "queue"
            : source.status === "active"
              ? "run"
              : "fallback",
      sourceCode: source.id,
      sourceLabel: source.label,
      sourceEnabled: source.enabled !== false,
      runLocked: source.enabled === false || latestRun?.status === "RUNNING",
      latestRunStatus: latestRun?.status ?? "UNSEEN",
      latestRunAt: latestRun?.startedAt.toISOString() ?? "No runs yet",
      latestRunId: latestRun?.id ?? "-",
      processed: latestRun?.processed ?? 0,
      written: latestRun?.written ?? 0,
      skipped: latestRun?.skipped ?? 0
    };
  }).filter((task) => {
    if (taskCategoryFilter && task.category !== taskCategoryFilter) {
      return false;
    }

    if (taskStatusFilter && task.status !== taskStatusFilter) {
      return false;
    }

    return true;
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (alertSeverityFilter && alert.severity !== alertSeverityFilter) {
      return false;
    }

    if (alertStateFilter && (alert.state ?? "OPEN") !== alertStateFilter) {
      return false;
    }

    return true;
  });

  const completedRuns = jobRuns.filter((run) => run.status === "COMPLETED").length;
  const failedRuns = jobRuns.filter((run) => run.status === "FAILED").length;
  const runningRuns = jobRuns.filter((run) => run.status === "RUNNING").length;
  const openSeverities = filteredAlerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const ingestionRuns = jobRuns.length
    ? jobRuns.slice(0, 8).map((run) => ({
        name: run.name,
        processed: run.processed,
        written: run.written,
        skipped: run.skipped,
        status: run.status,
        stage: run.stage,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? "In progress",
        note: run.note ?? ""
      }))
    : fallbackIngestionRuns.map((run) => ({
        ...run,
        stage: "ingestion",
        startedAt: "Demo run",
        finishedAt: run.status === "dry-run" ? "Not persisted" : "Completed",
        note: "Generated from local demo adapters."
      }));

  return {
    summary: [
      { label: "Registered tasks", value: String(tasks.length), detail: "Automated jobs registered across ingestion and analysis stages." },
      { label: "Active sources", value: String(sources.filter((source) => source.status === "active").length), detail: "Feeds currently marked active in the registry." },
      { label: "Open alerts", value: String(filteredAlerts.length), detail: "Current market or model alerts visible to operators." },
      { label: "Fallback feeds", value: String(sources.filter((source) => source.status === "fallback").length), detail: "Backup sources kept available for degraded mode." }
    ],
    tasks,
    alerts: filteredAlerts.map((alert) => ({
      id: alert.id,
      match: alert.match,
      severity: alert.severity,
      category: alert.market,
      message: alert.message,
      state: alert.state ?? "OPEN",
      canAcknowledge: alert.state !== "ACKNOWLEDGED" && alert.state !== "RESOLVED",
      canResolve: alert.state !== "RESOLVED"
    })),
    statusRing: [
      { label: "Running jobs", value: String(runningRuns) },
      { label: "Completed jobs", value: String(completedRuns) },
      { label: "Failed jobs", value: String(failedRuns) },
      { label: "High alerts", value: String((openSeverities.HIGH ?? 0) + (openSeverities.CRITICAL ?? 0)) }
    ],
    securitySummary: [
      {
        label: "Failed Logins",
        value: String(auditLogs.filter((log) => log.action === "LOGIN_FAILED").length),
        detail: "Recent failed operator sign-in attempts."
      },
      {
        label: "Unauthorized Hits",
        value: String(auditLogs.filter((log) => log.action === "UNAUTHORIZED_ACCESS").length),
        detail: "Unauthorized requests against protected operator APIs."
      },
      {
        label: "Rate Limited",
        value: String(auditLogs.filter((log) => log.action === "LOGIN_RATE_LIMITED").length),
        detail: "Login attempts blocked by the rate limiter."
      },
      {
        label: "Security Events",
        value: String(auditLogs.filter((log) => log.action === "LOGIN_FAILED" || log.action === "UNAUTHORIZED_ACCESS" || log.action === "LOGIN_RATE_LIMITED").length),
        detail: "Combined security events including failed logins, unauthorized access and rate limiting."
      }
    ],
    auditTrail: auditLogs.map((log) => ({
      actor: log.actor,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? "-",
      createdAt: log.createdAt.toISOString(),
      summary: readMetadataString(log.metadata, "summary", `${log.action} on ${log.entityType}`),
      ip: readMetadataString(log.metadata, "ip"),
      userAgent: readMetadataString(log.metadata, "userAgent"),
      path: readMetadataString(log.metadata, "path")
    })),
    auditFilters: {
      actors: ["all", ...new Set(auditLogs.map((log) => log.actor))],
      actions: ["all", ...new Set(auditLogs.map((log) => log.action))],
      entityTypes: ["all", ...new Set(auditLogs.map((log) => log.entityType))],
      activeActor: filters?.actor ?? "all",
      activeAction: filters?.action ?? "all",
      activeEntityType: filters?.entityType ?? "all"
    },
    taskFilters: {
      categories: ["all", ...new Set(sources.map((source) => source.category))],
      statuses: ["all", ...new Set(sources.map((source) => source.status))],
      activeCategory: filters?.taskCategory ?? "all",
      activeStatus: filters?.taskStatus ?? "all"
    },
    alertFilters: {
      severities: ["all", ...new Set(alerts.map((alert) => alert.severity))],
      states: ["all", ...new Set(alerts.map((alert) => alert.state ?? "OPEN"))],
      activeSeverity: filters?.alertSeverity ?? "all",
      activeState: filters?.alertState ?? "all"
    },
    securityEvents: auditLogs
      .filter((log) => log.action === "LOGIN_FAILED" || log.action === "UNAUTHORIZED_ACCESS" || log.action === "LOGIN_RATE_LIMITED")
      .map((log) => ({
        actor: log.actor,
        action: log.action,
        summary: readMetadataString(log.metadata, "summary", `${log.action} on ${log.entityType}`),
        createdAt: log.createdAt.toISOString(),
        ip: readMetadataString(log.metadata, "ip"),
        path: readMetadataString(log.metadata, "path")
      })),
    recentRuns: jobRuns.slice(0, 12).filter((run) => {
      if (runStatusFilter && run.status !== runStatusFilter) return false;
      if (runStageFilter && run.stage !== runStageFilter) return false;
      if (runNameFilter && run.name !== runNameFilter) return false;
      return true;
    }).map((run) => ({
      id: run.id,
      name: run.name,
      stage: run.stage,
      status: run.status,
      processed: run.processed,
      written: run.written,
      skipped: run.skipped,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString() ?? "In progress",
      durationMs: run.finishedAt ? run.finishedAt.getTime() - run.startedAt.getTime() : null,
      note: run.note ?? ""
    })),
    runFilters: {
      statuses: ["all", ...new Set(jobRuns.map((run) => run.status))],
      stages: ["all", ...new Set(jobRuns.map((run) => run.stage))],
      names: ["all", ...new Set(jobRuns.map((run) => run.name))],
      activeStatus: filters?.runStatus ?? "all",
      activeStage: filters?.runStage ?? "all",
      activeName: filters?.runName ?? "all"
    },
    ingestionRuns
  };
}
