import type { OddsAlert } from "@/lib/types";

export function OddsAlertList({ alerts }: { alerts: OddsAlert[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-xl border border-line p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{alert.match}</h3>
              <p className="mt-1 text-xs text-muted">{alert.market} · {alert.timestamp}</p>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-warning">{alert.severity}</span>
          </div>
          <p className="mt-3 text-sm text-muted">{alert.message}</p>
        </article>
      ))}
    </div>
  );
}
