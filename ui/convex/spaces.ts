import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("spaces").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("spaces", args);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("spaces").first();
    if (existing) return "already seeded";

    const spaces = [
      { name: "Personal", description: "Personal finance tracking", icon: "User" },
      { name: "Business", description: "Business income and expenses", icon: "Building" },
      { name: "Investments", description: "Investment portfolio tracking", icon: "TrendingUp" },
      { name: "Tax Planning", description: "Tax deductions and planning", icon: "Calculator" },
    ];
    for (const s of spaces) await ctx.db.insert("spaces", s);
    return "seeded";
  },
});
