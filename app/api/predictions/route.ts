import { NextResponse } from "next/server";
import { getTopPredictions } from "@/lib/server/platform-data";

export async function GET() {
  return NextResponse.json({ data: await getTopPredictions() });
}
