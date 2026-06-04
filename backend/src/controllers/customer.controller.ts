import type { Request, Response } from "express";
import {
  customerCreateSchema,
  customerUpdateSchema,
  customerParamsSchema,
  customerOrgParamsSchema,
  paginationQuerySchema,
} from "@smeo/shared";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service.js";

export async function list(request: Request, response: Response) {
  const { organizationId } = customerOrgParamsSchema.parse(request.params);
  const pagination = paginationQuerySchema.parse(request.query);
  const result = await listCustomers(organizationId, pagination);
  response.json({ customers: result.items, pagination: result.pagination });
}

export async function getById(request: Request, response: Response) {
  const { organizationId, customerId } = customerParamsSchema.parse(request.params);
  const customer = await getCustomer(organizationId, customerId);
  response.json({ customer });
}

export async function create(request: Request, response: Response) {
  const { organizationId } = customerOrgParamsSchema.parse(request.params);
  const input = customerCreateSchema.parse(request.body);
  const customer = await createCustomer(organizationId, input);
  response.status(201).json({ customer });
}

export async function update(request: Request, response: Response) {
  const { organizationId, customerId } = customerParamsSchema.parse(request.params);
  const input = customerUpdateSchema.parse(request.body);
  const customer = await updateCustomer(organizationId, customerId, input);
  response.json({ customer });
}

export async function remove(request: Request, response: Response) {
  const { organizationId, customerId } = customerParamsSchema.parse(request.params);
  await deleteCustomer(organizationId, customerId);
  response.status(204).send();
}