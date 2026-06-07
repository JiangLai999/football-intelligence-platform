import { NextResponse } from "next/server";
import { getDashboardSummary, getHotMatches, getOddsAlerts, getTopPredictions } from "@/lib/server/platform-data";

export async function GET() {
  const [summary, topPredictions, hotMatches, alerts] = await Promise.all([
    getDashboardSummary(),
    getTopPredictions(),
    getHotMatches(),
    getOddsAlerts()
  ]);

  return NextResponse.json({
    data: {
      summary,
      topPredictions,
      hotMatches,
      alerts
    }
  });
}
