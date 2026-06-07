import type { MatchDetailView } from "@/lib/types";

export function MatchDetailPanel({ detail }: { detail: MatchDetailView }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent">{detail.competition}</p>
            <h1 className="mt-2 text-3xl font-bold">{detail.homeTeam} vs {detail.awayTeam}</h1>
            <p className="mt-2 text-sm text-muted">{detail.roundName} · {detail.kickoff} · {detail.venue}</p>
            <p className="mt-3 text-sm text-muted">{detail.momentumTag} · {detail.travelContext}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line px-4 py-3 text-sm">
              <div className="text-muted">状态</div>
              <div className="mt-1 font-semibold">{detail.status}</div>
            </div>
            <div className="rounded-xl border border-line px-4 py-3 text-sm">
              <div className="text-muted">比分</div>
              <div className="mt-1 font-semibold">{detail.score?.home ?? "-"} : {detail.score?.away ?? "-"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl p-5 panel">
          <p className="text-sm text-muted">预期进球</p>
          <p className="mt-3 text-2xl font-bold">{detail.expectedGoals.home ?? "-"} : {detail.expectedGoals.away ?? "-"}</p>
          <p className="mt-2 text-sm text-muted">模型预测预期进球数。</p>
        </article>
        <article className="rounded-2xl p-5 panel">
          <p className="text-sm text-muted">休整优势</p>
          <p className="mt-3 text-2xl font-bold">{detail.restAdvantage}</p>
          <p className="mt-2 text-sm text-muted">基于休息日和客场旅程计算的体能优势。</p>
        </article>
        <article className="rounded-2xl p-5 panel">
          <p className="text-sm text-muted">市场倾向</p>
          <p className="mt-3 text-2xl font-bold">{detail.marketOverview}</p>
          <p className="mt-2 text-sm text-muted">存储的市场快照显示的共识倾向。</p>
        </article>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">运营上下文</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {detail.operationalNotes.map((note) => (
              <div key={note} className="rounded-xl border border-line p-4 text-sm text-muted">
                {note}
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">主队近期状态</p>
              <p className="mt-2 font-semibold">{detail.formGuide.home}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">客队近期状态</p>
              <p className="mt-2 font-semibold">{detail.formGuide.away}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">主队关键球员</p>
              <p className="mt-2 text-sm text-text">{detail.keyPlayers.home.join(", ")}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">客队关键球员</p>
              <p className="mt-2 text-sm text-text">{detail.keyPlayers.away.join(", ")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">预测概览</h2>
          <span className="rounded-full border border-line px-3 py-1 text-xs">{detail.predictionOverview.confidence}</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">主队胜</p>
            <p className="mt-2 text-2xl font-bold">{detail.predictionOverview.homeWin}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">平局</p>
            <p className="mt-2 text-2xl font-bold">{detail.predictionOverview.draw}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">客队胜</p>
            <p className="mt-2 text-2xl font-bold">{detail.predictionOverview.awayWin}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-line p-4">
          <p className="text-sm text-muted">推荐比分</p>
          <p className="mt-2 text-2xl font-bold">{detail.predictionOverview.scoreline}</p>
          <p className="mt-4 text-sm text-muted">风险等级: {detail.predictionOverview.risk}</p>
          <p className="mt-4 text-sm leading-6 text-text">{detail.predictionOverview.explanation}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">阵容概览</h2>
          <p className="mt-2 text-sm text-muted">
            {detail.lineupSummary.confirmed ? "已加载确认的首发阵容。" : "预测阵容，待官方确认后更新。"}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">{detail.homeTeam} · {detail.lineupSummary.homeFormation}</p>
              <ul className="mt-3 space-y-2 text-sm text-text">
                {detail.lineupSummary.home.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-muted">{detail.awayTeam} · {detail.lineupSummary.awayFormation}</p>
              <ul className="mt-3 space-y-2 text-sm text-text">
                {detail.lineupSummary.away.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">市场快照</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl border border-line p-4">
              <p className="text-muted">数据源</p>
              <p className="mt-2 font-semibold">{detail.marketSnapshot.source}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-muted">市场类型</p>
              <p className="mt-2 font-semibold">{detail.marketSnapshot.marketType}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-muted">盘口</p>
              <p className="mt-2 font-semibold">{detail.marketSnapshot.line}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-muted">抽水</p>
              <p className="mt-2 font-semibold">{detail.marketSnapshot.overround}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">数据统计</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-panelAlt text-muted">
              <tr>
                <th className="px-4 py-3">指标</th>
                <th className="px-4 py-3">{detail.homeTeam}</th>
                <th className="px-4 py-3">{detail.awayTeam}</th>
              </tr>
            </thead>
            <tbody>
              {detail.statSnapshot.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3">{row.home}</td>
                  <td className="px-4 py-3">{row.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">模型 vs 市场</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">主队</p>
            <p className="mt-2 text-sm text-muted">模型: {detail.modelVsMarket.modelHome}</p>
            <p className="mt-1 text-sm text-muted">市场: {detail.modelVsMarket.marketHome}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">平局</p>
            <p className="mt-2 text-sm text-muted">模型: {detail.modelVsMarket.modelDraw}</p>
            <p className="mt-1 text-sm text-muted">市场: {detail.modelVsMarket.marketDraw}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm text-muted">客队</p>
            <p className="mt-2 text-sm text-muted">模型: {detail.modelVsMarket.modelAway}</p>
            <p className="mt-1 text-sm text-muted">市场: {detail.modelVsMarket.marketAway}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-line p-4 text-sm text-muted">
          {detail.modelVsMarket.valueLean}
        </div>
      </section>

      <section className="rounded-2xl p-6 panel">
        <h2 className="text-xl font-semibold">战术总结</h2>
        <ul className="mt-5 space-y-3 text-sm text-muted">
          {detail.tacticalSummary.map((item) => (
            <li key={item} className="rounded-xl border border-line p-4">{item}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">近期赛事事件</h2>
          <div className="mt-5 space-y-3">
            {detail.recentEvents.length ? detail.recentEvents.map((event) => (
              <article key={`${event.minute}-${event.type}-${event.detail}`} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{event.team}</div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs">{event.minute}</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{event.type}</p>
                <p className="mt-3 text-sm text-muted">{event.detail}</p>
              </article>
            )) : <div className="rounded-xl border border-line p-4 text-sm text-muted">暂无近期赛事事件记录。</div>}
          </div>
        </article>

        <article className="rounded-2xl p-6 panel">
          <h2 className="text-xl font-semibold">告警汇总</h2>
          <div className="mt-5 space-y-3">
            {detail.alertSummary.length ? detail.alertSummary.map((alert) => (
              <article key={`${alert.severity}-${alert.category}-${alert.message}`} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{alert.category}</div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs">{alert.severity}</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{alert.state}</p>
                <p className="mt-3 text-sm text-muted">{alert.message}</p>
              </article>
            )) : <div className="rounded-xl border border-line p-4 text-sm text-muted">暂无与此比赛关联的活跃告警。</div>}
          </div>
        </article>
      </section>
    </div>
  );
}
