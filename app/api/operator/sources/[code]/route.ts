import { NextResponse } from "next/server";
import { hasOperatorSession } from "@/lib/server/auth";
import { getAuditRequestContext, writeAuditLog, writeUnauthorizedAuditLog } from "@/lib/server/audit";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const requestContext = getAuditRequestContext(request);
  if (!(await hasOperatorSession())) {
    await writeUnauthorizedAuditLog({
      entityType: "operator-api",
      entityId: "/api/operator/sources/[code]",
      summary: "Unauthorized attempt to modify feed source state.",
      context: requestContext
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const body = await request.json().catch(() => ({}));
  const enabled = typeof body.enabled === "boolean" ? body.enabled : true;

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      message: "Demo mode source toggle accepted",
      data: { code: params.code, enabled }
    });
  }

  const source = await prisma.feedSourceConfig.update({
    where: { code: params.code },
    data: {
      enabled,
      status: enabled ? "ACTIVE" : "DISABLED"
    }
  });

  await writeAuditLog({
    actor: process.env.OPERATOR_USERNAME ?? "operator",
    action: enabled ? "SOURCE_ENABLED" : "SOURCE_DISABLED",
    entityType: "feed-source",
    entityId: source.code,
    metadata: {
      summary: `${source.label} was ${enabled ? "enabled" : "disabled"}.`,
      enabled,
      ...requestContext
    }
  });

  return NextResponse.json({ message: "Source updated", data: source });
}
