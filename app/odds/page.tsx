import { OddsAlertList } from "@/components/odds-alert-list";
import { getOddsAlerts } from "@/lib/server/platform-data";

export default async function OddsPage() {
  const oddsAlerts = await getOddsAlerts();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">赔率情报</h1>
        <p className="mt-2 text-sm text-muted">
          监控开盘赔率、即时变动、市场共识、精准偏离和自动告警评分。
        </p>
      </div>
      <div className="rounded-2xl p-5 panel">
        <OddsAlertList alerts={oddsAlerts} />
      </div>
    </div>
  );
}
