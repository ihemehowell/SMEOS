import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { CustomerCreateInput, CustomerUpdateInput } from "@smeo/shared";

export async function listCustomers(organizationId: string) {
  return prisma.customer.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
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