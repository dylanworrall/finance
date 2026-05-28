import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("invoices").order("desc").collect();
    if (args.status) results = results.filter((i) => i.status === args.status);
    return results;
  },
});

export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    lineItems: v.array(v.object({ description: v.string(), quantity: v.number(), unitPrice: v.number() })),
    taxRate: v.optional(v.number()),
    dueDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lineItems = args.lineItems.map((item) => ({ ...item, total: item.quantity * item.unitPrice }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = args.taxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const now = new Date().toISOString();

    return await ctx.db.insert("invoices", {
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: "draft",
      dueDate: args.dueDate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("overdue"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status, updatedAt: new Date().toISOString() };
    if (args.status === "paid") updates.paidAt = new Date().toISOString();
    await ctx.db.patch(args.id, updates);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("invoices").first();
    if (existing) return "already seeded";

    await ctx.db.insert("invoices", {
      clientName: "TechCorp Inc.",
      clientEmail: "billing@techcorp.com",
      lineItems: [{ description: "Cannabis Consulting - Q1", quantity: 1, unitPrice: 5000, total: 5000 }],
      subtotal: 5000,
      taxRate: 0,
      taxAmount: 0,
      total: 5000,
      status: "paid",
      dueDate: "2026-02-28",
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-02-15T14:30:00Z",
      paidAt: "2026-02-15T14:30:00Z",
    });
    await ctx.db.insert("invoices", {
      clientName: "GreenLeaf Partners",
      clientEmail: "ap@greenleaf.co",
      lineItems: [
        { description: "Compliance Review", quantity: 1, unitPrice: 2500, total: 2500 },
        { description: "License Application Support", quantity: 1, unitPrice: 1500, total: 1500 },
      ],
      subtotal: 4000,
      taxRate: 0,
      taxAmount: 0,
      total: 4000,
      status: "sent",
      dueDate: "2026-03-15",
      createdAt: "2026-03-01T09:00:00Z",
      updatedAt: "2026-03-01T09:00:00Z",
    });
    return "seeded";
  },
});
