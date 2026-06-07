import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeAuditLog, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestContext = getAuditRequestContext(request);
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator/alerts/[id]",
      summary: "Unauthorized attempt to modify operator alert state.",
      context: requestContext
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const body = await request.json().catch(() => ({}));
  const state = typeof body.state === "string" ? body.state : "ACKNOWLEDGED";
  const allowedStates = new Set(["OPEN", "ACKNOWLEDGED", "RESOLVED"]);

  if (!allowedStates.has(state)) {
    return NextResponse.json({ error: "Invalid alert state" }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      message: "Demo mode alert state change accepted",
      data: { id: params.id, state }
    });
  }

  const existingAlert = await prisma.alert.findUnique({ where: { id: params.id } });
  if (!existingAlert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  if (existingAlert.state === "RESOLVED" && state === "ACKNOWLEDGED") {
    return NextResponse.json({ error: "Resolved alerts cannot move back to acknowledged" }, { status: 409 });
  }

  const alert = await prisma.alert.update({
    where: { id: params.id },
    data: { state: state as never }
  });

  await writeAuditLog({
    actor: process.env.OPERATOR_USERNAME ?? "operator",
    action: "ALERT_STATE_UPDATED",
    entityType: "alert",
    entityId: alert.id,
    metadata: {
      summary: `Alert moved to ${state}.`,
      state,
      ...requestContext
    }
  });

  return NextResponse.json({ message: "Alert updated", data: alert });
}
