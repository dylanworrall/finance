import { tool } from "ai";
import { z } from "zod";
import {
  getTransactions,
  getTransactionById,
  addTransaction,
  searchTransactions,
  updateTransaction,
} from "@/lib/stores/transactions";
import { getAccountById } from "@/lib/stores/accounts";

export const transactionTools = {
  list_transactions: tool({
    description: "List transactions with optional filters (type, category, account, date range)",
    inputSchema: z.object({
      type: z.enum(["income", "expense", "transfer"]).optional().describe("Filter by transaction type"),
      category: z.string().optional().describe("Filter by category name"),
      accountId: z.string().optional().describe("Filter by account ID"),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    }),
    execute: async ({ type, category, accountId, startDate, endDate }) => {
      const txns = getTransactions({ type, category, accountId, startDate, endDate });
      const total = txns.reduce((sum, t) => sum + (t.type === "expense" ? -t.amount : t.amount), 0);
      return {
        count: txns.length,
        total,
        transactions: txns.map((t) => ({
          ...t,
          accountName: getAccountById(t.accountId)?.name ?? t.accountId,
        })),
      };
    },
  }),

  add_transaction: tool({
    description: "Add a new transaction (income, expense, or transfer)",
    inputSchema: z.object({
      type: z.enum(["income", "expense", "transfer"]).describe("Transaction type"),
      amount: z.number().positive().describe("Amount in dollars"),
      category: z.string().describe("Category name"),
      description: z.string().describe("Transaction description"),
      accountId: z.string().describe("Account ID"),
      date: z.string().describe("Date (YYYY-MM-DD)"),
    }),
    execute: async ({ type, amount, category, description, accountId, date }) => {
      const txn = addTransaction({ type, amount, category, description, accountId, date });
      return { success: true, transaction: txn };
    },
  }),

  categorize_transaction: tool({
    description: "Update the category of an existing transaction",
    inputSchema: z.object({
      transactionId: z.string().describe("Transaction ID"),
      category: z.string().describe("New category name"),
    }),
    execute: async ({ transactionId, category }) => {
      const txn = updateTransaction(transactionId, { category });
      if (!txn) return { success: false, error: `Transaction ${transactionId} not found` };
      return { success: true, transaction: txn };
    },
  }),

  search_transactions: tool({
    description: "Search transactions by keyword (matches description, category, or ID)",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => {
      const results = searchTransactions(query);
      return { count: results.length, transactions: results };
    },
  }),

  get_transaction: tool({
    description: "Get a single transaction by its ID",
    inputSchema: z.object({
      transactionId: z.string().describe("Transaction ID"),
    }),
    execute: async ({ transactionId }) => {
      const txn = getTransactionById(transactionId);
      if (!txn) return { error: `Transaction ${transactionId} not found` };
      return { transaction: { ...txn, accountName: getAccountById(txn.accountId)?.name ?? txn.accountId } };
    },
  }),
};
