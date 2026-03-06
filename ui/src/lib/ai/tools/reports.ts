import { tool } from "ai";
import { z } from "zod";
import { getReports, getReportById, addReport } from "@/lib/stores/reports";
import { getTransactions } from "@/lib/stores/transactions";

export const reportTools = {
  generate_report: tool({
    description: "Generate a financial report (monthly_summary, category_breakdown, cash_flow, or tax_summary)",
    inputSchema: z.object({
      type: z.enum(["monthly_summary", "category_breakdown", "cash_flow", "tax_summary"]).describe("Report type"),
      title: z.string().describe("Report title"),
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    }),
    execute: async ({ type, title, startDate, endDate }) => {
      const txns = getTransactions({ startDate, endDate });
      const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      let data: Record<string, unknown> = {};
      if (type === "monthly_summary") {
        data = { totalIncome: income, totalExpenses: expenses, netIncome: income - expenses, transactionCount: txns.length };
      } else if (type === "category_breakdown") {
        const byCategory: Record<string, number> = {};
        txns.forEach((t) => {
          byCategory[t.category] = (byCategory[t.category] ?? 0) + (t.type === "expense" ? -t.amount : t.amount);
        });
        data = { categories: Object.entries(byCategory).map(([name, total]) => ({ name, total })) };
      } else if (type === "cash_flow") {
        data = { inflow: income, outflow: expenses, net: income - expenses, transactionCount: txns.length };
      } else {
        const deductible = expenses;
        data = { totalIncome: income, totalDeductions: deductible, taxableIncome: income - deductible };
      }

      const report = addReport({ type, title, dateRange: { start: startDate, end: endDate }, data });
      return { success: true, report };
    },
  }),

  list_reports: tool({
    description: "List all generated reports",
    inputSchema: z.object({}),
    execute: async () => {
      const reports = getReports();
      return { count: reports.length, reports };
    },
  }),

  get_report: tool({
    description: "Get a specific report by ID with its full data",
    inputSchema: z.object({
      reportId: z.string().describe("Report ID"),
    }),
    execute: async ({ reportId }) => {
      const report = getReportById(reportId);
      if (!report) return { error: `Report ${reportId} not found` };
      return { report };
    },
  }),

  export_report: tool({
    description: "Export a report as a formatted text summary",
    inputSchema: z.object({
      reportId: z.string().describe("Report ID"),
    }),
    execute: async ({ reportId }) => {
      const report = getReportById(reportId);
      if (!report) return { error: `Report ${reportId} not found` };
      return {
        title: report.title,
        type: report.type,
        dateRange: `${report.dateRange.start} to ${report.dateRange.end}`,
        data: report.data,
        exportedAt: new Date().toISOString(),
      };
    },
  }),
};
