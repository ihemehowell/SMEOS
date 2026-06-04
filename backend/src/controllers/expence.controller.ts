import type { Request, Response } from "express";
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseParamsSchema,
  expenseOrgParamsSchema,
  paginationQuerySchema,
} from "@smeo/shared";
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expense.service.js";

export async function list(request: Request, response: Response) {
  const { organizationId } = expenseOrgParamsSchema.parse(request.params);
  const pagination = paginationQuerySchema.parse(request.query);
  const result = await listExpenses(organizationId, pagination);
  response.json({ expenses: result.items, pagination: result.pagination });
}

export async function getById(request: Request, response: Response) {
  const { organizationId, expenseId } = expenseParamsSchema.parse(request.params);
  const expense = await getExpense(organizationId, expenseId);
  response.json({ expense });
}

export async function create(request: Request, response: Response) {
  const { organizationId } = expenseOrgParamsSchema.parse(request.params);
  const input = expenseCreateSchema.parse(request.body);
  const expense = await createExpense(organizationId, input);
  response.status(201).json({ expense });
}

export async function update(request: Request, response: Response) {
  const { organizationId, expenseId } = expenseParamsSchema.parse(request.params);
  const input = expenseUpdateSchema.parse(request.body);
  const expense = await updateExpense(organizationId, expenseId, input);
  response.json({ expense });
}

export async function remove(request: Request, response: Response) {
  const { organizationId, expenseId } = expenseParamsSchema.parse(request.params);
  await deleteExpense(organizationId, expenseId);
  response.status(204).send();
}