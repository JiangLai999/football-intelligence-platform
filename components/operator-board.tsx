"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OperatorOverview } from "@/lib/types";

async function postJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function OperatorBoard({ data }: { data: OperatorOverview }) {
  const router = useRouter();
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  function runTask(name: string, stage: string) {
    setPendingLabel(name);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await postJson("/api/operator/jobs/run", {
          method: "POST",
          body: JSON.stringify({ name, stage })
        });
        setMessage(result.message ?? `${name} processed`);
        router.refresh();
      } catch {
        setMessage(`Failed to queue ${name}`);
      } finally {
        setPendingLabel(null);
      }
    });
  }

  function toggleSource(sourceCode: string, enabled: boolean) {
    setPendingLabel(sourceCode);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await postJson(`/api/operator/sources/${sourceCode}`, {
          method: "PATCH",
          body: JSON.stringify({ enabled })
        });
        setMessage(result.message ?? `${sourceCode} updated`);
        router.refresh();
      } catch {
        setMessage(`Failed to update ${sourceCode}`);
      } finally {
        setPendingLabel(null);
      }
    });
  }

  function updateAlert(alertId: string, state: string) {
    setPendingLabel(alertId);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await postJson(`/api/operator/alerts/${alertId}`, {
          method: "PATCH",
          body: JSON.stringify({ state })
        });
        setMessage(result.message ?? `Alert ${state.toLowerCase()}`);
        router.refresh();
      } catch {
        setMessage(`Failed to update alert ${alertId}`);
      } finally {
        setPendingLabel(null);
      }
    });
  }

  function updateFilter(
    key: "actor" | "action" | "entityType" | "taskCategory" | "taskStatus" | "alertSeverity" | "alertState" | "runStatus" | "runStage" | "runName",
    value: string
  ) {
    const params = new URLSearchParams(window.location.search);

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    window.location.href = `/operator${query ? `?${query}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {message ? (
        <section className="rounded-2xl border border-line bg-panelAlt/60 p-4 text-sm text-muted">
          {message}
          {isPending ? " 处理中..." : null}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((item) => (
          <article key={item.label} className="rounded-2xl p-5 panel">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
            <p className="mt-3 text-sm text-muted">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.statusRing.map((item) => (
          <article key={item.label} className="rounded-2xl border border-line bg-panelAlt/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.securitySummary.map((item) => (
          <article key={item.label} className="rounded-2xl border border-line bg-panelAlt/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-warning">{item.label}</p>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
            <p className="mt-2 text-sm text-muted">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">任务注册表</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-muted">
              分类
              <select
                className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
                value={data.taskFilters.activeCategory}
                onChange={(event) => updateFilter("taskCategory", event.target.value)}
              >
                {data.taskFilters.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted">
              状态
              <select
                className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
                value={data.taskFilters.activeStatus}
                onChange={(event) => updateFilter("taskStatus", event.target.value)}
              >
                {data.taskFilters.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 space-y-3">
            {data.tasks.map((task) => (
              <article key={task.name} className="rounded-xl border border-line p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold">{task.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{task.stage} · {task.category} · {task.sourceLabel}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line px-3 py-1 text-xs">{task.status}</span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs">{task.actionLabel}</span>
                    <button
                      type="button"
                      className="rounded-full border border-line px-3 py-1 text-xs disabled:opacity-50"
                      disabled={isPending || pendingLabel === task.name || task.runLocked}
                      onClick={() => runTask(task.name, task.stage)}
                    >
                      {task.latestRunStatus === "RUNNING" ? "运行中" : "立即执行"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-line px-3 py-1 text-xs disabled:opacity-50"
                      disabled={isPending || pendingLabel === task.sourceCode}
                      onClick={() => toggleSource(task.sourceCode, !task.sourceEnabled)}
                    >
                      {task.sourceEnabled ? "禁用源" : "启用源"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">更新频率: {task.cadence}</p>
                <p className="mt-2 text-sm text-muted">最近运行: {task.latestRunStatus} · {task.latestRunAt}</p>
                <p className="mt-2 text-sm text-muted">最近运行ID: {task.latestRunId}</p>
                <p className="mt-2 text-sm text-muted">已处理 {task.processed} · 已写入 {task.written} · 已跳过 {task.skipped}</p>
                <p className="mt-2 text-sm text-muted">数据源已启用: {task.sourceEnabled ? "是" : "否"}</p>
                <p className="mt-2 text-sm text-muted">{task.note}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">运维告警队列</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-muted">
              严重程度
              <select
                className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
                value={data.alertFilters.activeSeverity}
                onChange={(event) => updateFilter("alertSeverity", event.target.value)}
              >
                {data.alertFilters.severities.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted">
              状态
              <select
                className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
                value={data.alertFilters.activeState}
                onChange={(event) => updateFilter("alertState", event.target.value)}
              >
                {data.alertFilters.states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 space-y-3">
            {data.alerts.map((alert) => (
              <article key={alert.id} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{alert.match}</div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs">{alert.severity}</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{alert.category}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">状态: {alert.state}</p>
                <p className="mt-3 text-sm text-muted">{alert.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-line px-3 py-1 text-xs disabled:opacity-50"
                    disabled={isPending || pendingLabel === alert.id || !alert.canAcknowledge}
                    onClick={() => updateAlert(alert.id, "ACKNOWLEDGED")}
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-line px-3 py-1 text-xs disabled:opacity-50"
                    disabled={isPending || pendingLabel === alert.id || !alert.canResolve}
                    onClick={() => updateAlert(alert.id, "RESOLVED")}
                  >
                    解决
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">最近摄取运行</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-panelAlt text-muted">
              <tr>
                <th className="px-4 py-3">任务</th>
                <th className="px-4 py-3">已处理</th>
                <th className="px-4 py-3">已写入</th>
                <th className="px-4 py-3">已跳过</th>
                <th className="px-4 py-3">阶段</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {data.ingestionRuns.map((run) => (
                <tr key={`${run.name}-${run.startedAt}`} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">{run.name}</td>
                  <td className="px-4 py-3">{run.processed}</td>
                  <td className="px-4 py-3">{run.written}</td>
                  <td className="px-4 py-3">{run.skipped}</td>
                  <td className="px-4 py-3">{run.stage}</td>
                  <td className="px-4 py-3">{run.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">最近任务历史</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-muted">
            状态
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.runFilters.activeStatus}
              onChange={(event) => updateFilter("runStatus", event.target.value)}
            >
              {data.runFilters.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            阶段
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.runFilters.activeStage}
              onChange={(event) => updateFilter("runStage", event.target.value)}
            >
              {data.runFilters.stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            任务名
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.runFilters.activeName}
              onChange={(event) => updateFilter("runName", event.target.value)}
            >
              {data.runFilters.names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-panelAlt text-muted">
              <tr>
                <th className="px-4 py-3">运行ID</th>
                <th className="px-4 py-3">任务名</th>
                <th className="px-4 py-3">阶段</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">耗时</th>
                <th className="px-4 py-3">已处理</th>
                <th className="px-4 py-3">已写入</th>
                <th className="px-4 py-3">已跳过</th>
                <th className="px-4 py-3">详情</th>
              </tr>
            </thead>
            <tbody>
              {data.recentRuns.map((run) => (
                <tr key={run.id} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium">{run.id}</td>
                  <td className="px-4 py-3">{run.name}</td>
                  <td className="px-4 py-3">{run.stage}</td>
                  <td className="px-4 py-3">{run.status}</td>
                  <td className="px-4 py-3">{run.durationMs == null ? "运行中" : `${run.durationMs} 毫秒`}</td>
                  <td className="px-4 py-3">{run.processed}</td>
                  <td className="px-4 py-3">{run.written}</td>
                  <td className="px-4 py-3">{run.skipped}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs text-accent"
                      onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                    >
                      {expandedRunId === run.id ? "收起" : "展开"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-3">
          {data.recentRuns.filter((run) => expandedRunId === run.id).map((run) => (
            <article key={`${run.id}-detail`} className="rounded-xl border border-accent/30 bg-panelAlt/40 p-4 text-sm text-muted">
              <div className="font-semibold text-text">{run.name} · {run.status}</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p>开始时间: {run.startedAt}</p>
                  <p className="mt-1">结束时间: {run.finishedAt}</p>
                  <p className="mt-1">耗时: {run.durationMs == null ? "运行中" : `${run.durationMs} 毫秒`}</p>
                </div>
                <div>
                  <p>已处理: {run.processed}</p>
                  <p className="mt-1">已写入: {run.written}</p>
                  <p className="mt-1">已跳过: {run.skipped}</p>
                </div>
              </div>
              <p className="mt-3">备注: {run.note || "无备注"}</p>
              <p className="mt-2">运���ID: {run.id}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">最近审计日志</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-muted">
            操作者
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.auditFilters.activeActor}
              onChange={(event) => updateFilter("actor", event.target.value)}
            >
              {data.auditFilters.actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            操作
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.auditFilters.activeAction}
              onChange={(event) => updateFilter("action", event.target.value)}
            >
              {data.auditFilters.actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            实体类型
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-text"
              value={data.auditFilters.activeEntityType}
              onChange={(event) => updateFilter("entityType", event.target.value)}
            >
              {data.auditFilters.entityTypes.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {entityType}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 space-y-3">
          {data.auditTrail.length ? (
            data.auditTrail.map((entry) => (
              <article key={`${entry.createdAt}-${entry.action}-${entry.entityId}`} className="rounded-xl border border-line p-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-semibold">{entry.action}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                      {entry.entityType} · {entry.entityId} · {entry.actor}
                    </div>
                  </div>
                  <div className="text-xs text-muted">{entry.createdAt}</div>
                </div>
                <p className="mt-3 text-sm text-muted">{entry.summary}</p>
                <p className="mt-2 text-xs text-muted">路径: {entry.path} · IP: {entry.ip}</p>
                <p className="mt-1 text-xs text-muted">User-Agent: {entry.userAgent}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-line p-4 text-sm text-muted">暂无审计事件记录。</div>
          )}
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">安全事件</h2>
        <div className="mt-5 space-y-3">
          {data.securityEvents.length ? (
            data.securityEvents.map((event) => (
              <article key={`${event.createdAt}-${event.action}-${event.ip}`} className="rounded-xl border border-line p-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-semibold text-warning">{event.action}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{event.actor} · {event.ip}</div>
                  </div>
                  <div className="text-xs text-muted">{event.createdAt}</div>
                </div>
                <p className="mt-3 text-sm text-muted">{event.summary}</p>
                <p className="mt-2 text-xs text-muted">路径: {event.path}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-line p-4 text-sm text-muted">当前过滤窗口内暂无安全事件。</div>
          )}
        </div>
      </section>
    </div>
  );
}
