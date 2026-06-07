import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

type AuditInput = {
  actor: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function writeAuditLog(input: AuditInput) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await prisma.auditLog.create({
      data: {
        actor: input.actor,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata
      }
    });
  } catch {
    return null;
  }
}

export function getAuditRequestContext(request: Request | NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return {
    ip: forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown",
    userAgent: request.headers.get("user-agent") ?? "unknown",
    path: new URL(request.url).pathname
  };
}

export async function writeUnauthorizedAuditLog(input: {
  entityType: string;
  action?: string;
  entityId?: string;
  summary: string;
  context?: {
    ip: string;
    userAgent: string;
    path: string;
  };
}) {
  return writeAuditLog({
    actor: "anonymous",
    action: input.action ?? "UNAUTHORIZED_ACCESS",
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: {
      summary: input.summary,
      ip: input.context?.ip,
      userAgent: input.context?.userAgent,
      path: input.context?.path
    }
  });
}
