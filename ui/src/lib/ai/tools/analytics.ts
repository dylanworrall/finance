import { tool } from "ai";
import { z } from "zod";
import { getTransactions } from "@/lib/stores/transactions";

export const analyticsTools = {
  monthly_summary: tool({
    description: "Get a summary of income, expenses, and net for a given month (YYYY-MM)",
    inputSchema: z.object({
      month: z.string().describe("Month in YYYY-MM format"),
    }),
    execute: async ({ month }) => {
      const startDate = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const endDate = `${y}-${String(m).padStart(2, "0")}-31`;
      const txns = getTransactions({ startDate, endDate });
      const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { month, income, expenses, net: income - expenses, transactionCount: txns.length };
    },
  }),

  category_breakdown: tool({
    description: "Get spending/income breakdown by category for a date range",
    inputSchema: z.object({
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    }),
    execute: async ({ startDate, endDate }) => {
      const txns = getTransactions({ startDate, endDate });
      const byCategory: Record<string, { income: number; expense: number }> = {};
      txns.forEach((t) => {
        if (!byCategory[t.category]) byCategory[t.category] = { income: 0, expense: 0 };
        if (t.type === "income") byCategory[t.category].income += t.amount;
        else if (t.type === "expense") byCategory[t.category].expense += t.amount;
      });
      return {
        dateRange: { startDate, endDate },
        categories: Object.entries(byCategory).map(([name, data]) => ({
          name,
          ...data,
          net: data.income - data.expense,
        })),
      };
    },
  }),

  cash_flow_analysis: tool({
    description: "Analyze cash flow — total inflows, outflows, and net — for a date range",
    inputSchema: z.object({
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    }),
    execute: async ({ startDate, endDate }) => {
      const txns = getTransactions({ startDate, endDate });
      const inflow = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const outflow = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { dateRange: { startDate, endDate }, inflow, outflow, net: inflow - outflow, transactionCount: txns.length };
    },
  }),

  compare_periods: tool({
    description: "Compare income and expenses between two date ranges",
    inputSchema: z.object({
      period1Start: z.string().describe("Period 1 start date (YYYY-MM-DD)"),
      period1End: z.string().describe("Period 1 end date (YYYY-MM-DD)"),
      period2Start: z.string().describe("Period 2 start date (YYYY-MM-DD)"),
      period2End: z.string().describe("Period 2 end date (YYYY-MM-DD)"),
    }),
    execute: async ({ period1Start, period1End, period2Start, period2End }) => {
      const txns1 = getTransactions({ startDate: period1Start, endDate: period1End });
      const txns2 = getTransactions({ startDate: period2Start, endDate: period2End });

      const summarize = (txns: typeof txns1) => ({
        income: txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        count: txns.length,
      });

      const p1 = summarize(txns1);
      const p2 = summarize(txns2);

      return {
        period1: { dateRange: { start: period1Start, end: period1End }, ...p1, net: p1.income - p1.expenses },
        period2: { dateRange: { start: period2Start, end: period2End }, ...p2, net: p2.income - p2.expenses },
        change: {
          income: p2.income - p1.income,
          expenses: p2.expenses - p1.expenses,
          net: (p2.income - p2.expenses) - (p1.income - p1.expenses),
        },
      };
    },
  }),
};
