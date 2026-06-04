import type { Request, Response } from "express";
import {
  quotationCreateSchema,
  quotationUpdateSchema,
  quotationParamsSchema,
  quotationOrgParamsSchema,
  paginationQuerySchema,
} from "@smeo/shared";
import {
  listQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../services/quotation.service.js";

export async function list(request: Request, response: Response) {
  const { organizationId } = quotationOrgParamsSchema.parse(request.params);
  const pagination = paginationQuerySchema.parse(request.query);
  const result = await listQuotations(organizationId, pagination);
  response.json({ quotations: result.items, pagination: result.pagination });
}

export async function getById(request: Request, response: Response) {
  const { organizationId, quotationId } = quotationParamsSchema.parse(request.params);
  const quotation = await getQuotation(organizationId, quotationId);
  response.json({ quotation });
}

export async function create(request: Request, response: Response) {
  const { organizationId } = quotationOrgParamsSchema.parse(request.params);
  const input = quotationCreateSchema.parse(request.body);
  const quotation = await createQuotation(organizationId, input);
  response.status(201).json({ quotation });
}

export async function update(request: Request, response: Response) {
  const { organizationId, quotationId } = quotationParamsSchema.parse(request.params);
  const input = quotationUpdateSchema.parse(request.body);
  const quotation = await updateQuotation(organizationId, quotationId, input);
  response.json({ quotation });
}

export async function remove(request: Request, response: Response) {
  const { organizationId, quotationId } = quotationParamsSchema.parse(request.params);
  await deleteQuotation(organizationId, quotationId);
  response.status(204).send();
}