import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { getJobRuns } from "@/lib/server/jobs";

export async function GET(request: Request) {
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator/jobs",
      summary: "Unauthorized access attempt to operator jobs API.",
      context: getAuditRequestContext(request)
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const stage = url.searchParams.get("stage") ?? undefined;
  const name = url.searchParams.get("name") ?? undefined;

  const runs = await getJobRuns({ limit: 40, status, stage, name });
  return NextResponse.json({ data: runs });
}
