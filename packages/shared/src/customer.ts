import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerParamsSchema = z.object({
  organizationId: z.string().min(1),
  customerId: z.string().min(1),
});

export const customerOrgParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;