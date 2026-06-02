import { z } from "zod";

export const organizationCreateSchema = z.object({
  name: z.string().min(1),
});

export const organizationParamsSchema = z.object({
  organizationId: z.string().min(1),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type OrganizationParams = z.infer<typeof organizationParamsSchema>;