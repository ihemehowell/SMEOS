import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { InvoiceCreateInput, InvoiceUpdateInput } from "@smeo/shared";
import type { PaginationQueryInput } from "@smeo/shared";
import type { Prisma } from "../generated/client.js";
import { buildPaginationMeta, getPaginationArgs, type PaginatedResult } from "../lib/pagination.js";

type InvoiceListItem = Awaited<ReturnType<typeof prisma.invoice.findMany>>[number];

async function getNextInvoiceNumber(
  tx: Prisma.TransactionClient,
  organizationId: string,
) {
  const last = await tx.invoice.findFirst({
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
  return { subtotal, tax: 0, total: subtotal };
}

const invoiceInclude = {
  customer: { select: { id: true, name: true, email: true, phone: true } },
  quotation: { select: { id: true, number: true } },
  items: true,
} as const;

export async function listInvoices(
  organizationId: string,
  pagination: PaginationQueryInput,
): Promise<PaginatedResult<InvoiceListItem>> {
  const where = { organizationId, deletedAt: null };
  const { page, limit } = pagination;

  const [total, invoices] = await prisma.$transaction([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...getPaginationArgs(page, limit),
      include: invoiceInclude,
    }),
  ]);

  return {
    items: invoices,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getInvoice(organizationId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId, deletedAt: null },
    include: invoiceInclude,
  });

  if (!invoice) {
    throw new HttpError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }

  return invoice;
}

export async function createInvoice(
  organizationId: string,
  input: InvoiceCreateInput,
) {
  const { subtotal, tax, total } = calculateTotals(input.items);

  return prisma.$transaction(async (tx) => {
    const number = await getNextInvoiceNumber(tx, organizationId);

    return tx.invoice.create({
      data: {
        organizationId,
        customerId: input.customerId ?? null,
        quotationId: input.quotationId ?? null,
        number,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
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
      include: invoiceInclude,
    });
  });
}

export async function createInvoiceFromQuotation(
  organizationId: string,
  quotationId: string,
) {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, organizationId, deletedAt: null },
    include: { items: true },
  });

  if (!quotation) {
    throw new HttpError(404, "Quotation not found", "QUOTATION_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const number = await getNextInvoiceNumber(tx, organizationId);

    return tx.invoice.create({
      data: {
        organizationId,
        customerId: quotation.customerId,
        quotationId: quotation.id,
        number,
        notes: quotation.notes,
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        total: quotation.total,
        items: {
          create: quotation.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: invoiceInclude,
    });
  });
}

export async function updateInvoice(
  organizationId: string,
  invoiceId: string,
  input: InvoiceUpdateInput,
) {
  await getInvoice(organizationId, invoiceId);

  return prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.invoiceItem.deleteMany({ where: { invoiceId } });
    }

    const { subtotal, tax, total } = input.items
      ? calculateTotals(input.items)
      : { subtotal: undefined, tax: undefined, total: undefined };

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(input.customerId !== undefined && { customerId: input.customerId }),
        ...(input.status && {
          status: input.status,
          ...(input.status === "PAID" && { paidAt: new Date() }),
        }),
        ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
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
      include: invoiceInclude,
    });
  });
}

export async function deleteInvoice(
  organizationId: string,
  invoiceId: string,
) {
  await getInvoice(organizationId, invoiceId);
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { deletedAt: new Date() },
  });
}