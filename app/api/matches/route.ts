import { NextResponse } from "next/server";
import { getHotMatches } from "@/lib/server/platform-data";

export async function GET() {
  return NextResponse.json({ data: await getHotMatches() });
}
