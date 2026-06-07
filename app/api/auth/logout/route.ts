import { NextResponse } from "next/server";
import { clearOperatorSession, getOperatorSessionActor } from "@/lib/server/auth";
import { getAuditRequestContext, writeAuditLog } from "@/lib/server/audit";

export async function POST(request: Request) {
  const actor = (await getOperatorSessionActor()) ?? process.env.OPERATOR_USERNAME ?? "operator";
  const requestContext = getAuditRequestContext(request);
  await writeAuditLog({
    actor,
    action: "LOGOUT",
    entityType: "session",
    metadata: {
      summary: "Operator signed out.",
      ...requestContext
    }
  });
  await clearOperatorSession();
  return NextResponse.json({ success: true });
}
