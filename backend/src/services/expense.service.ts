import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { ExpenseCreateInput, ExpenseUpdateInput } from "@smeo/shared";
import type { PaginationQueryInput } from "@smeo/shared";
import { buildPaginationMeta, getPaginationArgs, type PaginatedResult } from "../lib/pagination.js";

type ExpenseListItem = Awaited<ReturnType<typeof prisma.expense.findMany>>[number];

export async function listExpenses(
  organizationId: string,
  pagination: PaginationQueryInput,
): Promise<PaginatedResult<ExpenseListItem>> {
  const where = { organizationId, deletedAt: null };
  const { page, limit } = pagination;

  const [total, expenses] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      ...getPaginationArgs(page, limit),
    }),
  ]);

  return {
    items: expenses,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getExpense(organizationId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, organizationId, deletedAt: null },
  });

  if (!expense) {
    throw new HttpError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  }

  return expense;
}

export async function createExpense(
  organizationId: string,
  input: ExpenseCreateInput,
) {
  return prisma.expense.create({
    data: {
      organizationId,
      description: input.description,
      category: input.category,
      amount: input.amount,
      date: input.date ? new Date(input.date) : new Date(),
      notes: input.notes ?? null,
    },
  });
}

export async function updateExpense(
  organizationId: string,
  expenseId: string,
  input: ExpenseUpdateInput,
) {
  await getExpense(organizationId, expenseId);

  return prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(input.description && { description: input.description }),
      ...(input.category && { category: input.category }),
      ...(input.amount && { amount: input.amount }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  });
}

export async function deleteExpense(
  organizationId: string,
  expenseId: string,
) {
  await getExpense(organizationId, expenseId);
  return prisma.expense.update({
    where: { id: expenseId },
    data: { deletedAt: new Date() },
  });
}