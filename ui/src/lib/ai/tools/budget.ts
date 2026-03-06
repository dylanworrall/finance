import { tool } from "ai";
import { z } from "zod";
import { getBudgets, getBudgetByCategory, addBudget, updateBudget } from "@/lib/stores/budgets";

export const budgetTools = {
  get_budget_status: tool({
    description: "Get the status of all budgets or a specific category budget",
    inputSchema: z.object({
      category: z.string().optional().describe("Category name (omit for all budgets)"),
    }),
    execute: async ({ category }) => {
      if (category) {
        const budget = getBudgetByCategory(category);
        if (!budget) return { error: `No budget found for category "${category}"` };
        const pct = Math.round((budget.spent / budget.limit) * 100);
        const remaining = budget.limit - budget.spent;
        return { budget: { ...budget, percentUsed: pct, remaining } };
      }
      const budgets = getBudgets();
      return {
        count: budgets.length,
        budgets: budgets.map((b) => ({
          ...b,
          percentUsed: Math.round((b.spent / b.limit) * 100),
          remaining: b.limit - b.spent,
        })),
      };
    },
  }),

  set_budget: tool({
    description: "Create or update a budget for a spending category",
    inputSchema: z.object({
      category: z.string().describe("Category name"),
      limit: z.number().positive().describe("Budget limit in dollars"),
      period: z.enum(["monthly", "quarterly", "yearly"]).default("monthly").describe("Budget period"),
    }),
    execute: async ({ category, limit, period }) => {
      const existing = getBudgetByCategory(category);
      if (existing) {
        const updated = updateBudget(existing.id, { limit, period });
        return { success: true, action: "updated", budget: updated };
      }
      const budget = addBudget({ category, limit, spent: 0, period });
      return { success: true, action: "created", budget };
    },
  }),

  check_spending: tool({
    description: "Check spending against budget for a category — warns if over or near limit",
    inputSchema: z.object({
      category: z.string().describe("Category name"),
    }),
    execute: async ({ category }) => {
      const budget = getBudgetByCategory(category);
      if (!budget) return { error: `No budget set for "${category}". Use set_budget to create one.` };
      const pct = Math.round((budget.spent / budget.limit) * 100);
      const remaining = budget.limit - budget.spent;
      let status: "under" | "warning" | "over" = "under";
      if (pct >= 100) status = "over";
      else if (pct >= 80) status = "warning";
      return { category, spent: budget.spent, limit: budget.limit, percentUsed: pct, remaining, status };
    },
  }),
};
