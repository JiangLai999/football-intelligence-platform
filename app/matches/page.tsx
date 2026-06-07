import { MatchTable } from "@/components/match-table";
import { getHotMatches } from "@/lib/server/platform-data";

export default async function MatchesPage() {
  const hotMatches = await getHotMatches();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">赛事中心</h1>
        <p className="mt-2 text-sm text-muted">
          多赛事赛程看板,集成市场快照、阵容状态及模型输出。
        </p>
      </div>
      <div className="rounded-2xl p-5 panel">
        <MatchTable matches={hotMatches} />
      </div>
    </div>
  );
}
