import { tool } from "ai";
import { z } from "zod";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from "@/lib/stores/invoices";
import { addActivity } from "@/lib/stores/activity";

export const invoiceTools = {
  create_invoice: tool({
    description:
      "Create a new invoice with line items for a client. This creates a draft invoice.",
    inputSchema: z.object({
      clientName: z.string().describe("Client's full name or company name"),
      clientEmail: z.string().describe("Client's email address"),
      lineItems: z
        .array(
          z.object({
            description: z.string().describe("Line item description"),
            quantity: z.number().default(1).describe("Quantity"),
            unitPrice: z.number().describe("Price per unit in dollars"),
          })
        )
        .describe("Invoice line items"),
      taxRate: z.number().default(0).describe("Tax rate as percentage (e.g. 8.5 for 8.5%)"),
      dueDate: z.string().describe("Due date (YYYY-MM-DD)"),
      notes: z.string().default("").describe("Additional notes for the invoice"),
    }),
    execute: async ({ clientName, clientEmail, lineItems, taxRate, dueDate, notes }) => {
      const invoice = createInvoice({
        clientName,
        clientEmail,
        lineItems,
        taxRate,
        dueDate,
        notes: notes || undefined,
      });

      addActivity(
        "invoice_created",
        `Invoice ${invoice.id} created for ${clientName} — $${invoice.total.toLocaleString()}`,
        { invoiceId: invoice.id }
      );

      return {
        message: `Invoice ${invoice.id} created for ${clientName} — $${invoice.total.toLocaleString()} (status: draft)`,
        invoice,
      };
    },
  }),

  list_invoices: tool({
    description: "List all invoices, optionally filtered by status",
    inputSchema: z.object({
      status: z
        .enum(["draft", "sent", "paid", "overdue", "cancelled"])
        .default("draft")
        .describe("Filter by invoice status, or use any value to see all"),
    }),
    execute: async ({ status }) => {
      const invoices = getInvoices(status === "draft" ? undefined : status);
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
      return {
        message: `${invoices.length} invoice(s) — total: $${totalAmount.toLocaleString()}`,
        invoices,
      };
    },
  }),

  get_invoice: tool({
    description: "Get a specific invoice by its ID",
    inputSchema: z.object({
      id: z.string().describe("Invoice ID (e.g. INV-001)"),
    }),
    execute: async ({ id }) => {
      const invoice = getInvoiceById(id);
      if (!invoice) {
        return `Invoice ${id} not found`;
      }
      return `Invoice ${invoice.id}: ${invoice.clientName} — $${invoice.total.toLocaleString()} (${invoice.status})\nClient: ${invoice.clientEmail}\nDue: ${invoice.dueDate}\nItems: ${invoice.lineItems.map((i) => `${i.description}: $${i.total}`).join(", ")}`;
    },
  }),

  send_invoice: tool({
    description:
      "Send an invoice to the client's email. This marks the invoice as 'sent'.",
    inputSchema: z.object({
      id: z.string().describe("Invoice ID to send"),
    }),
    execute: async ({ id }) => {
      const invoice = updateInvoiceStatus(id, "sent");
      if (!invoice) {
        return `Invoice ${id} not found`;
      }

      addActivity(
        "invoice_sent",
        `Invoice ${invoice.id} sent to ${invoice.clientEmail} — $${invoice.total.toLocaleString()}`,
        { invoiceId: invoice.id, clientEmail: invoice.clientEmail }
      );

      return `Invoice ${invoice.id} sent to ${invoice.clientEmail} — $${invoice.total.toLocaleString()}`;
    },
  }),
};
