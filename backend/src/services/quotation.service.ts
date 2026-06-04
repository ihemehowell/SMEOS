import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { QuotationCreateInput, QuotationUpdateInput } from "@smeo/shared";
import type { PaginationQueryInput } from "@smeo/shared";
import type { Prisma } from "../generated/client.js";
import { buildPaginationMeta, getPaginationArgs, type PaginatedResult } from "../lib/pagination.js";

type QuotationListItem = Awaited<ReturnType<typeof prisma.quotation.findMany>>[number];

async function getNextQuotationNumber(
  tx: Prisma.TransactionClient,
  organizationId: string,
) {
  const last = await tx.quotation.findFirst({
    where: { organizationId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}

function calculateTotals(items: { quantity: number; unitPrice: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = 0;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export async function listQuotations(
  organizationId: string,
  pagination: PaginationQueryInput,
): Promise<PaginatedResult<QuotationListItem>> {
  const where = { organizationId, deletedAt: null };
  const { page, limit } = pagination;

  const [total, quotations] = await prisma.$transaction([
    prisma.quotation.count({ where }),
    prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...getPaginationArgs(page, limit),
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    }),
  ]);

  return {
    items: quotations,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getQuotation(
  organizationId: string,
  quotationId: string,
) {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, organizationId, deletedAt: null },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: true,
    },
  });

  if (!quotation) {
    throw new HttpError(404, "Quotation not found", "QUOTATION_NOT_FOUND");
  }

  return quotation;
}

export async function createQuotation(
  organizationId: string,
  input: QuotationCreateInput,
) {
  const { subtotal, tax, total } = calculateTotals(input.items);

  return prisma.$transaction(async (tx) => {
    const number = await getNextQuotationNumber(tx, organizationId);

    return tx.quotation.create({
      data: {
        organizationId,
        customerId: input.customerId ?? null,
        number,
        issueDate: input.issueDate ? new Date(input.issueDate) : new Date(),
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        notes: input.notes ?? null,
        subtotal,
        tax,
        total,
        items: {
          create: input.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  });
}

export async function updateQuotation(
  organizationId: string,
  quotationId: string,
  input: QuotationUpdateInput,
) {
  await getQuotation(organizationId, quotationId);

  return prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.quotationItem.deleteMany({ where: { quotationId } });
    }

    const { subtotal, tax, total } = input.items
      ? calculateTotals(input.items)
      : { subtotal: undefined, tax: undefined, total: undefined };

    return tx.quotation.update({
      where: { id: quotationId },
      data: {
        ...(input.customerId !== undefined && { customerId: input.customerId }),
        ...(input.status && { status: input.status }),
        ...(input.issueDate && { issueDate: new Date(input.issueDate) }),
        ...(input.expiryDate && { expiryDate: new Date(input.expiryDate) }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(subtotal !== undefined && { subtotal, tax, total }),
        ...(input.items && {
          items: {
            create: input.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        }),
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  });
}

export async function deleteQuotation(
  organizationId: string,
  quotationId: string,
) {
  await getQuotation(organizationId, quotationId);
  return prisma.quotation.update({
    where: { id: quotationId },
    data: { deletedAt: new Date() },
  });
}