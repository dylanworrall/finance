import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    type: v.optional(v.string()),
    category: v.optional(v.string()),
    accountId: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("transactions").order("desc").collect();
    if (args.type) results = results.filter((t) => t.type === args.type);
    if (args.category) results = results.filter((t) => t.category.toLowerCase() === args.category!.toLowerCase());
    if (args.accountId) results = results.filter((t) => t.accountId === args.accountId);
    if (args.startDate) results = results.filter((t) => t.date >= args.startDate!);
    if (args.endDate) results = results.filter((t) => t.date <= args.endDate!);
    return results;
  },
});

export const add = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    accountId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("transactions").first();
    if (existing) return "already seeded";

    const txns = [
      { type: "income" as const, amount: 5000, category: "Consulting", description: "TechCorp Q1 consulting payment", accountId: "ACC-001", date: "2026-02-15" },
      { type: "expense" as const, amount: 1200, category: "Software", description: "Annual SaaS subscriptions", accountId: "ACC-001", date: "2026-02-18" },
      { type: "income" as const, amount: 3200, category: "Services", description: "GreenLeaf compliance audit", accountId: "ACC-001", date: "2026-02-22" },
      { type: "expense" as const, amount: 450, category: "Office", description: "Office supplies and equipment", accountId: "ACC-002", date: "2026-02-25" },
      { type: "income" as const, amount: 4000, category: "Consulting", description: "CannaVentures retainer", accountId: "ACC-001", date: "2026-03-03" },
    ];
    for (const t of txns) await ctx.db.insert("transactions", t);
    return "seeded";
  },
});
