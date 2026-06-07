import { getTeams } from "@/lib/server/platform-data";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">球队情报</h1>
        <p className="mt-2 text-sm text-muted">
          球队档案、评分快照、赛程负荷、阵容质量及模型强度指数。
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <article key={team.name} className="rounded-2xl p-5 panel">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <p className="mt-1 text-sm text-muted">{team.competition}</p>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-accent">{team.rating}</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">进攻</dt>
                <dd className="mt-1 font-semibold">{team.attack}</dd>
              </div>
              <div>
                <dt className="text-muted">防守</dt>
                <dd className="mt-1 font-semibold">{team.defense}</dd>
              </div>
              <div>
                <dt className="text-muted">赛程负荷</dt>
                <dd className="mt-1 font-semibold">{team.scheduleLoad}</dd>
              </div>
              <div>
                <dt className="text-muted">伤病影响</dt>
                <dd className="mt-1 font-semibold">{team.injuryImpact}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
