import Link from "next/link";
import type { MatchRow } from "@/lib/types";

export function MatchTable({ matches }: { matches: MatchRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-panelAlt text-muted">
          <tr>
            <th className="px-4 py-3">开球时间</th>
            <th className="px-4 py-3">赛事</th>
            <th className="px-4 py-3">比赛</th>
            <th className="px-4 py-3">市场</th>
            <th className="px-4 py-3">模型</th>
            <th className="px-4 py-3">风险</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id} className="border-t border-line">
              <td className="px-4 py-3 text-muted">{match.kickoff}</td>
              <td className="px-4 py-3">{match.competition}</td>
              <td className="px-4 py-3">
                <div className="font-medium">
                  <Link className="hover:text-accent" href={`/matches/${match.id}`}>
                    {match.home} vs {match.away}
                  </Link>
                </div>
                <div className="mt-1 text-xs text-muted">{match.context}</div>
              </td>
              <td className="px-4 py-3">{match.marketLean}</td>
              <td className="px-4 py-3">{match.modelLean}</td>
              <td className="px-4 py-3">
                <span className="rounded-full border border-line px-2 py-1 text-xs">{match.risk}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
