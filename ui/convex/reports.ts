import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("monthly_summary"), v.literal("category_breakdown"), v.literal("cash_flow"), v.literal("tax_summary")),
    title: v.string(),
    dateRange: v.object({ start: v.string(), end: v.string() }),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reports").first();
    if (existing) return "already seeded";

    await ctx.db.insert("reports", {
      type: "monthly_summary",
      title: "February 2026 Summary",
      dateRange: { start: "2026-02-01", end: "2026-02-28" },
      data: { totalIncome: 9400, totalExpenses: 4450, netIncome: 4950, transactionCount: 5 },
      createdAt: "2026-03-01T00:00:00Z",
    });
    return "seeded";
  },
});
