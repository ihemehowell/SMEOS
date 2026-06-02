import type { Request, Response } from "express";

import {
  createOrganization,
  getOrganizationById,
} from "../services/organization.service.js";
import { organizationCreateSchema, organizationParamsSchema } from "@smeo/shared";

export async function create(request: Request, response: Response) {
  if (!request.user?.userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const parsedBody = organizationCreateSchema.parse(request.body);
  const organization = await createOrganization(request.user.userId, parsedBody.name);
  response.status(201).json({ organization });
}

export async function getById(request: Request, response: Response) {
  const { organizationId } = organizationParamsSchema.parse(request.params);
  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    response.status(404).json({ message: "Organization not found" });
    return;
  }

  response.json({ organization });
}