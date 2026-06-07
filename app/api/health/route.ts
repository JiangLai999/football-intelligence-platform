import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "football-intelligence-platform",
    time: new Date().toISOString()
  });
}
