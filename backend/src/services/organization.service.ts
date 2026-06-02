import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";
import type { Prisma, Role } from "../generated/client.js";

function createOrganizationSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createOrganization(userId: string, name: string) {
  const organization = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const createdOrganization = await transaction.organization.create({
      data: {
        name,
        slug: createOrganizationSlug(name),
      },
    });

    await transaction.membership.create({
      data: {
        userId,
        organizationId: createdOrganization.id,
        role: "OWNER" satisfies Role,
      },
    });

    return createdOrganization;
  });

  return organization;
}

export async function getOrganizationById(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}