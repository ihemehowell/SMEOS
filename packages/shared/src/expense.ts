import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "SALARIES",
  "RENT",
  "UTILITIES",
  "MARKETING",
  "EQUIPMENT",
  "TRAVEL",
  "SOFTWARE",
  "PROFESSIONAL_SERVICES",
  "TAXES",
  "OTHER",
] as const;

export const expenseCreateSchema = z.object({
  description: z.string().min(1),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().int().positive(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseParamsSchema = z.object({
  organizationId: z.string().min(1),
  expenseId: z.string().min(1),
});

export const expenseOrgParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];