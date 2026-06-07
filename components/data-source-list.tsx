import type { DataSourceDescriptor } from "@/lib/types";

export function DataSourceList({ sources }: { sources: DataSourceDescriptor[] }) {
  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <article key={source.id} className="rounded-2xl p-5 panel">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-accent">{source.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{source.label}</h2>
              <p className="mt-2 text-sm text-muted">{source.notes}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full border border-line px-3 py-1">{source.mode}</span>
              <span className="rounded-full border border-line px-3 py-1">{source.status}</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted">更新频率: {source.cadence}</div>
        </article>
      ))}
    </div>
  );
}
