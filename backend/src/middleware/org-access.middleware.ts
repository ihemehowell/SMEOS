import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function requireOrgAccess(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { organizationId } = request.params;

  if (!organizationId) {
    response.status(400).json({ error: { code: "BAD_REQUEST", message: "Missing organizationId" } });
    return;
  }

  if (!request.user?.userId) {
    response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      organizationId,
      userId: request.user.userId,
    },
  });

  if (!membership) {
    response.status(403).json({ error: { code: "FORBIDDEN", message: "You do not have access to this organization" } });
    return;
  }

  request.membership = membership;
  next();
}