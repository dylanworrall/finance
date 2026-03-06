import { tool } from "ai";
import { z } from "zod";
import {
  getPayments,
  getPaymentById,
  createRefund as storeCreateRefund,
  getRevenue as storeGetRevenue,
} from "@/lib/stores/payments";
import { addActivity } from "@/lib/stores/activity";

export const paymentTools = {
  list_payments: tool({
    description: "List received payments, optionally filtered by status",
    inputSchema: z.object({
      status: z
        .enum(["completed", "pending", "refunded", "partial_refund", "failed"])
        .default("completed")
        .describe("Filter by payment status"),
    }),
    execute: async ({ status }) => {
      const payments = getPayments(status === "completed" ? undefined : status);
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        message: `${payments.length} payment(s) — total: $${totalAmount.toLocaleString()}`,
        payments,
      };
    },
  }),

  get_payment: tool({
    description: "Get details of a specific payment by ID",
    inputSchema: z.object({
      id: z.string().describe("Payment ID (e.g. PAY-001)"),
    }),
    execute: async ({ id }) => {
      const payment = getPaymentById(id);
      if (!payment) {
        return `Payment ${id} not found`;
      }
      return `Payment ${payment.id}: $${payment.amount.toLocaleString()} from ${payment.clientName} (${payment.status})\nDescription: ${payment.description}\nDate: ${payment.createdAt}`;
    },
  }),

  create_refund: tool({
    description:
      "Refund a payment (full or partial). Requires approval before processing.",
    inputSchema: z.object({
      paymentId: z.string().describe("Payment ID to refund"),
      amount: z.number().describe("Refund amount in dollars"),
      reason: z.string().describe("Reason for the refund"),
    }),
    execute: async ({ paymentId, amount, reason }) => {
      const refund = storeCreateRefund({ paymentId, amount, reason });
      if (!refund) {
        return `Payment ${paymentId} not found`;
      }

      addActivity(
        "refund_issued",
        `Refund of $${amount.toLocaleString()} issued for payment ${paymentId} — ${reason}`,
        { paymentId, refundId: refund.id, amount }
      );

      return `Refund ${refund.id} of $${amount.toLocaleString()} processed for payment ${paymentId}\nReason: ${reason}`;
    },
  }),

  get_revenue: tool({
    description: "Get revenue summary for a time period (today, this week, this month, or all-time)",
    inputSchema: z.object({
      period: z
        .enum(["today", "week", "month", "all"])
        .default("month")
        .describe("Time period for revenue calculation"),
    }),
    execute: async ({ period }) => {
      const revenue = storeGetRevenue(period);
      const periodLabel =
        period === "today"
          ? "today"
          : period === "week"
            ? "this week"
            : period === "month"
              ? "this month"
              : "all-time";

      return {
        message: `Revenue ${periodLabel}: $${revenue.total.toLocaleString()} from ${revenue.count} payment(s)`,
        revenue: {
          period: periodLabel,
          total: revenue.total,
          count: revenue.count,
          payments: revenue.payments,
        },
      };
    },
  }),
};
