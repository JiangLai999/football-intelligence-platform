import Link from "next/link";
import { SummaryCard } from "@/components/summary-card";
import { MatchTable } from "@/components/match-table";
import { OddsAlertList } from "@/components/odds-alert-list";
import { PredictionCard } from "@/components/prediction-card";
import { getDashboardSummary, getHotMatches, getOddsAlerts, getTopPredictions } from "@/lib/server/platform-data";

export default async function HomePage() {
  const [dashboardSummary, hotMatches, oddsAlerts, topPredictions] = await Promise.all([
    getDashboardSummary(),
    getHotMatches(),
    getOddsAlerts(),
    getTopPredictions()
  ]);

  return (
    <div className="container-page space-y-8">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-accent">运维概览</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">足球智能平台</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              全栈足球数据分析工作区,覆盖赛事直播、实时赔率、自动 scouting、预测管道、回测实验及可解释市场情报。
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950" href="/predictions">
              打开预测中心
            </Link>
            <Link className="rounded-lg border border-line px-4 py-3 text-sm font-semibold text-text" href="/architecture">
              查看架构
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSummary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-2xl p-5 panel">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">重点赛事看板</h2>
            <Link className="text-sm text-accent" href="/matches">
              查看所有赛事
            </Link>
          </div>
          <MatchTable matches={hotMatches} />
        </div>
        <div className="space-y-4 rounded-2xl p-5 panel">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">赔率告警</h2>
            <Link className="text-sm text-accent" href="/odds">
              打开赔率中心
            </Link>
          </div>
          <OddsAlertList alerts={oddsAlerts} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl p-5 panel">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">热门预测</h2>
          <Link className="text-sm text-accent" href="/predictions">
            查看排名预测
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {topPredictions.map((prediction) => (
            <PredictionCard key={prediction.matchId} prediction={prediction} />
          ))}
        </div>
      </section>
    </div>
  );
}
