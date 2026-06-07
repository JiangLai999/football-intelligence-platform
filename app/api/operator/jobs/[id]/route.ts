import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { getJobRunById } from "@/lib/server/jobs";

function getDurationMs(startedAt: Date, finishedAt: Date | null) {
  if (!finishedAt) {
    return null;
  }

  return finishedAt.getTime() - startedAt.getTime();
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator/jobs/[id]",
      summary: "Unauthorized access attempt to operator job detail API.",
      context: getAuditRequestContext(request)
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const run = await getJobRunById(params.id);

  if (!run) {
    return NextResponse.json({ error: "Job run not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...run,
      durationMs: getDurationMs(run.startedAt, run.finishedAt)
    }
  });
}
