import { NextResponse } from "next/server";
import { getDataSources } from "@/lib/server/data-sources";

export function GET() {
  return NextResponse.json({ data: getDataSources() });
}
