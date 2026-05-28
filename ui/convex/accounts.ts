import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("checking"), v.literal("savings"), v.literal("credit"), v.literal("investment")),
    balance: v.number(),
    institution: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", args);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("accounts").first();
    if (existing) return "already seeded";

    const accounts = [
      { name: "Business Checking", type: "checking" as const, balance: 24350, institution: "Chase", color: "#10B981" },
      { name: "Operating Expenses", type: "checking" as const, balance: 8200, institution: "Chase", color: "#3B82F6" },
      { name: "Business Savings", type: "savings" as const, balance: 52000, institution: "Marcus", color: "#8B5CF6" },
      { name: "Business Credit Card", type: "credit" as const, balance: -3450, institution: "Amex", color: "#F59E0B" },
    ];
    for (const a of accounts) await ctx.db.insert("accounts", a);
    return "seeded";
  },
});
