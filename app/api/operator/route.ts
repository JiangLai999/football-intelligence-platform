import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { getOperatorOverview } from "@/lib/server/operator-data";

export async function GET(request: Request) {
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator",
      summary: "Unauthorized access attempt to operator overview API.",
      context: getAuditRequestContext(request)
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: await getOperatorOverview() });
}
