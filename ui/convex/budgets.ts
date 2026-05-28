import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("budgets").collect();
  },
});

export const add = mutation({
  args: {
    category: v.string(),
    limit: v.number(),
    spent: v.number(),
    period: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("budgets", args);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("budgets").first();
    if (existing) return "already seeded";

    const budgets = [
      { category: "Software", limit: 2000, spent: 1200, period: "monthly" as const },
      { category: "Marketing", limit: 5000, spent: 2800, period: "monthly" as const },
      { category: "Office", limit: 1000, spent: 450, period: "monthly" as const },
      { category: "Travel", limit: 3000, spent: 0, period: "quarterly" as const },
    ];
    for (const b of budgets) await ctx.db.insert("budgets", b);
    return "seeded";
  },
});
