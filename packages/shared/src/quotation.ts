import { z } from "zod";

export const quotationItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().positive(),
});

export const quotationCreateSchema = z.object({
  customerId: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(quotationItemSchema).min(1),
});

export const quotationUpdateSchema = z.object({
  customerId: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  items: z.array(quotationItemSchema).optional(),
});

export const quotationParamsSchema = z.object({
  organizationId: z.string().min(1),
  quotationId: z.string().min(1),
});

export const quotationOrgParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;