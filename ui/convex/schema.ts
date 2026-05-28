import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    name: v.string(),
    type: v.union(v.literal("checking"), v.literal("savings"), v.literal("credit"), v.literal("investment")),
    balance: v.number(),
    institution: v.string(),
    color: v.string(),
  }),

  transactions: defineTable({
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    accountId: v.string(),
    date: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_accountId", ["accountId"])
    .index("by_type", ["type"]),

  invoices: defineTable({
    clientName: v.string(),
    clientEmail: v.string(),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    dueDate: v.string(),
    notes: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    paidAt: v.optional(v.string()),
  }).index("by_status", ["status"]),

  payments: defineTable({
    invoiceId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("refunded"),
      v.literal("partial_refund"),
      v.literal("failed")
    ),
    clientName: v.string(),
    clientEmail: v.string(),
    description: v.string(),
    createdAt: v.string(),
  }).index("by_status", ["status"]),

  budgets: defineTable({
    category: v.string(),
    limit: v.number(),
    spent: v.number(),
    period: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("yearly")),
  }).index("by_category", ["category"]),

  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  plans: defineTable({
    productId: v.string(),
    name: v.string(),
    price: v.number(),
    currency: v.string(),
    billingPeriod: v.union(
      v.literal("one_time"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    createdAt: v.string(),
  }).index("by_productId", ["productId"]),

  reports: defineTable({
    type: v.union(
      v.literal("monthly_summary"),
      v.literal("category_breakdown"),
      v.literal("cash_flow"),
      v.literal("tax_summary")
    ),
    title: v.string(),
    dateRange: v.object({ start: v.string(), end: v.string() }),
    data: v.any(),
    createdAt: v.string(),
  }),

  categories: defineTable({
    name: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("both")),
    icon: v.string(),
    color: v.string(),
  }),

  spaces: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
  }),

  activity: defineTable({
    type: v.string(),
    summary: v.string(),
    timestamp: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_timestamp", ["timestamp"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    credits: v.number(),
    createdAt: v.string(),
  }).index("by_email", ["email"]),
});
