import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().positive(),
});

export const invoiceCreateSchema = z.object({
  customerId: z.string().optional(),
  quotationId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export const invoiceUpdateSchema = z.object({
  customerId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["UNPAID", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  items: z.array(invoiceItemSchema).optional(),
});

export const invoiceParamsSchema = z.object({
  organizationId: z.string().min(1),
  invoiceId: z.string().min(1),
});

export const invoiceOrgParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;