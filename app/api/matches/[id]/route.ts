import { NextResponse } from "next/server";
import { getMatchDetail } from "@/lib/server/platform-data";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const detail = await getMatchDetail(params.id);

  if (!detail) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({ data: detail });
}
