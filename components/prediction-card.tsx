import type { PredictionCardData } from "@/lib/types";

export function PredictionCard({ prediction }: { prediction: PredictionCardData }) {
  return (
    <article className="rounded-2xl p-5 panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">{prediction.competition}</p>
          <h3 className="mt-2 text-xl font-semibold">{prediction.match}</h3>
        </div>
        <span className="rounded-full border border-line px-3 py-1 text-xs">{prediction.confidence}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-line p-3">
          <p className="text-muted">主队</p>
          <p className="mt-2 text-lg font-bold">{prediction.homeWin}</p>
        </div>
        <div className="rounded-xl border border-line p-3">
          <p className="text-muted">平局</p>
          <p className="mt-2 text-lg font-bold">{prediction.draw}</p>
        </div>
        <div className="rounded-xl border border-line p-3">
          <p className="text-muted">客队</p>
          <p className="mt-2 text-lg font-bold">{prediction.awayWin}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-line p-4 text-sm">
        <p className="text-muted">推荐比分</p>
        <p className="mt-2 text-lg font-semibold">{prediction.scoreline}</p>
        <p className="mt-3 text-muted">{prediction.explanation}</p>
      </div>
    </article>
  );
}
