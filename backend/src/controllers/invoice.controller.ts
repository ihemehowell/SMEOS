import type { Request, Response } from "express";
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceParamsSchema,
  invoiceOrgParamsSchema,
  paginationQuerySchema,
} from "@smeo/shared";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  createInvoiceFromQuotation,
  updateInvoice,
  deleteInvoice,
} from "../services/invoice.service.js";
import { z } from "zod";

export async function list(request: Request, response: Response) {
  const { organizationId } = invoiceOrgParamsSchema.parse(request.params);
  const pagination = paginationQuerySchema.parse(request.query);
  const result = await listInvoices(organizationId, pagination);
  response.json({ invoices: result.items, pagination: result.pagination });
}

export async function getById(request: Request, response: Response) {
  const { organizationId, invoiceId } = invoiceParamsSchema.parse(request.params);
  const invoice = await getInvoice(organizationId, invoiceId);
  response.json({ invoice });
}

export async function create(request: Request, response: Response) {
  const { organizationId } = invoiceOrgParamsSchema.parse(request.params);
  const input = invoiceCreateSchema.parse(request.body);
  const invoice = await createInvoice(organizationId, input);
  response.status(201).json({ invoice });
}

export async function convertFromQuotation(request: Request, response: Response) {
  const { organizationId } = invoiceOrgParamsSchema.parse(request.params);
  const { quotationId } = z.object({ quotationId: z.string().min(1) }).parse(request.body);
  const invoice = await createInvoiceFromQuotation(organizationId, quotationId);
  response.status(201).json({ invoice });
}

export async function update(request: Request, response: Response) {
  const { organizationId, invoiceId } = invoiceParamsSchema.parse(request.params);
  const input = invoiceUpdateSchema.parse(request.body);
  const invoice = await updateInvoice(organizationId, invoiceId, input);
  response.json({ invoice });
}

export async function remove(request: Request, response: Response) {
  const { organizationId, invoiceId } = invoiceParamsSchema.parse(request.params);
  await deleteInvoice(organizationId, invoiceId);
  response.status(204).send();
}