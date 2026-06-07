import { NextResponse } from "next/server";
import { createOperatorSession, verifyOperatorCredentials } from "@/lib/server/auth";
import { getAuditRequestContext, writeAuditLog } from "@/lib/server/audit";
import { clearAttempts, getRemainingLockoutMs, isRateLimited, recordFailedAttempt } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const requestContext = getAuditRequestContext(request);
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  const ip = requestContext.ip;

  if (isRateLimited(username || "unknown", ip)) {
    const remainingMs = getRemainingLockoutMs(username || "unknown", ip);
    await writeAuditLog({
      actor: username || "unknown",
      action: "LOGIN_RATE_LIMITED",
      entityType: "session",
      metadata: {
        summary: `Login blocked by rate limiter for ${username || "unknown"}. Retry after ${Math.ceil(remainingMs / 60000)} minutes.`,
        remainingMs,
        ...requestContext
      }
    });
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429 }
    );
  }

  if (!verifyOperatorCredentials(username, password)) {
    recordFailedAttempt(username || "unknown", ip);
    await writeAuditLog({
      actor: username || "unknown",
      action: "LOGIN_FAILED",
      entityType: "session",
      metadata: {
        summary: `Failed operator login attempt for ${username || "unknown user"}.`,
        ...requestContext
      }
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearAttempts(username, ip);
  await createOperatorSession(username);
  await writeAuditLog({
    actor: username,
    action: "LOGIN",
    entityType: "session",
    metadata: {
      summary: "Operator signed in successfully.",
      ...requestContext
    }
  });

  return NextResponse.json({ success: true });
}
