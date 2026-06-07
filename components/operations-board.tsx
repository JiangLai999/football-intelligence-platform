const operationsCards = [
  {
    title: "摄取SLA",
    value: "99.2%",
    detail: "过去24小时内完成的任务无需人工干预。"
  },
  {
    title: "管道健康",
    value: "正常",
    detail: "所有已注册阶段已启动并响应探测检查。"
  },
  {
    title: "告警队列",
    value: "7 个待处理",
    detail: "市场偏离和阵容差异告警待人工审核。"
  },
  {
    title: "下次刷新",
    value: "15 分钟",
    detail: "赛前赛程的自动赔率和特征刷新周期。"
  }
];

const pipelineStages = [
  ["fixtures ingestion", "green", "主源数据活跃,备用快照可用。"],
  ["odds polling", "green", "共识快照按配置的频率更新。"],
  ["lineup monitoring", "yellow", "爬虫模式活跃;官方阵容锁定待最后时段。"],
  ["feature generation", "green", "衍生指标从最新仓库状态刷新。"],
  ["prediction refresh", "green", "集成引擎和市场��合输出已发布。"],
  ["report publication", "yellow", "运维报告自动生成;公开摘要等待推送。"]
] as const;

export function OperationsBoard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {operationsCards.map((card) => (
          <article key={card.title} className="rounded-2xl p-5 panel">
            <p className="text-sm text-muted">{card.title}</p>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
            <p className="mt-3 text-sm text-muted">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">管道阶段</h2>
        <div className="mt-5 space-y-3">
          {pipelineStages.map(([stage, color, detail]) => (
            <article key={stage} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold capitalize">{stage}</div>
                <span className="rounded-full border border-line px-3 py-1 text-xs">{color}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
