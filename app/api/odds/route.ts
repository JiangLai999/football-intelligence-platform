import { NextResponse } from "next/server";
import { getOddsAlerts } from "@/lib/server/platform-data";

export async function GET() {
  return NextResponse.json({ data: await getOddsAlerts() });
}
