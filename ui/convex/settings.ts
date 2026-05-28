import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const DEFAULTS: Record<string, unknown> = {
  agentModes: {},
  businessName: "",
  businessEmail: "you@example.com",
  businessAddress: "",
  defaultCurrency: "USD",
  defaultTaxRate: 0,
  anthropicModel: "claude-sonnet-4-20250514",
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("settings").collect();
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  },
});

export const update = mutation({
  args: { updates: v.any() },
  handler: async (ctx, args) => {
    const entries = Object.entries(args.updates as Record<string, unknown>);
    for (const [key, value] of entries) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("settings", { key, value });
      }
    }
    return args.updates;
  },
});
