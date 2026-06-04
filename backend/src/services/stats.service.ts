import { prisma } from "../lib/prisma.js";

export async function getDashboardStats(organizationId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCustomers,
    openInvoices,
    revenueThisMonth,
    revenueLastMonth,
    expensesThisMonth,
    expensesLastMonth,
    invoicesByStatus,
  ] = await Promise.all([
    // total active customers
    prisma.customer.count({
      where: { organizationId, deletedAt: null },
    }),

    // open invoices (unpaid + overdue)
    prisma.invoice.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: { in: ["UNPAID", "OVERDUE"] },
      },
      select: { total: true, status: true },
    }),

    // revenue this month (paid invoices)
    prisma.invoice.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        status: "PAID",
        paidAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),

    // revenue last month
    prisma.invoice.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        status: "PAID",
        paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    }),

    // expenses this month
    prisma.expense.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),

    // expenses last month
    prisma.expense.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),

    // invoices by status
    prisma.invoice.groupBy({
      by: ["status"],
      where: { organizationId, deletedAt: null },
      _count: { id: true },
      _sum: { total: true },
    }),
  ]);

  const openInvoicesTotal = openInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const currentRevenue = revenueThisMonth._sum.total ?? 0;
  const lastRevenue = revenueLastMonth._sum.total ?? 0;
  const currentExpenses = expensesThisMonth._sum.amount ?? 0;
  const lastExpenses = expensesLastMonth._sum.amount ?? 0;

  function percentChange(current: number, previous: number) {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalCustomers,
    openInvoices: {
      count: openInvoices.length,
      total: openInvoicesTotal,
    },
    revenue: {
      thisMonth: currentRevenue,
      lastMonth: lastRevenue,
      percentChange: percentChange(currentRevenue, lastRevenue),
    },
    expenses: {
      thisMonth: currentExpenses,
      lastMonth: lastExpenses,
      percentChange: percentChange(currentExpenses, lastExpenses),
    },
    profit: {
      thisMonth: currentRevenue - currentExpenses,
    },
    invoicesByStatus: invoicesByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
      total: s._sum.total ?? 0,
    })),
  };
}