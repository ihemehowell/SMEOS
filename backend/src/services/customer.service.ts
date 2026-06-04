import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { CustomerCreateInput, CustomerUpdateInput } from "@smeo/shared";
import type { PaginationQueryInput } from "@smeo/shared";
import { buildPaginationMeta, getPaginationArgs, type PaginatedResult } from "../lib/pagination.js";

type CustomerListItem = Awaited<ReturnType<typeof prisma.customer.findMany>>[number];

export async function listCustomers(
  organizationId: string,
  pagination: PaginationQueryInput,
): Promise<PaginatedResult<CustomerListItem>> {
  const where = {
    organizationId,
    deletedAt: null,
  };

  const { page, limit } = pagination;

  const [total, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...getPaginationArgs(page, limit),
    }),
  ]);

  return {
    items: customers,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getCustomer(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new HttpError(404, "Customer not found", "CUSTOMER_NOT_FOUND");
  }

  return customer;
}

export async function createCustomer(
  organizationId: string,
  input: CustomerCreateInput,
) {
  return prisma.customer.create({
    data: {
      organizationId,
      ...input,
    },
  });
}

export async function updateCustomer(
  organizationId: string,
  customerId: string,
  input: CustomerUpdateInput,
) {
  await getCustomer(organizationId, customerId);

  return prisma.customer.update({
    where: { id: customerId },
    data: input,
  });
}

export async function deleteCustomer(
  organizationId: string,
  customerId: string,
) {
  await getCustomer(organizationId, customerId);

  return prisma.customer.update({
    where: { id: customerId },
    data: { deletedAt: new Date() },
  });
}