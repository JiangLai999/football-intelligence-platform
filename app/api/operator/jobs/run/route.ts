import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { queueAndRunJob } from "@/lib/server/jobs";

export async function POST(request: Request) {
  const requestContext = getAuditRequestContext(request);
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator/jobs/run",
      summary: "Unauthorized attempt to trigger operator job execution.",
      context: requestContext
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "manual_job";
  const stage = typeof body.stage === "string" ? body.stage : "manual";

  const actor = process.env.OPERATOR_USERNAME ?? "operator";
  const completedRun = await queueAndRunJob(name, stage, {
    actor,
    requestContext
  });

  return NextResponse.json({
    message: completedRun.status === "FAILED" ? "Job finished with failure state" : "Job completed successfully",
    data: completedRun
  });
}
