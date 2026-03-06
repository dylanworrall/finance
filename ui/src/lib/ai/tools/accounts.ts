import { tool } from "ai";
import { z } from "zod";
import { getAccounts, getAccountById, addAccount, getTotalBalance } from "@/lib/stores/accounts";

export const accountTools = {
  list_accounts: tool({
    description: "List all financial accounts with their balances",
    inputSchema: z.object({}),
    execute: async () => {
      const accounts = getAccounts();
      const totalBalance = getTotalBalance();
      return { count: accounts.length, totalBalance, accounts };
    },
  }),

  get_account: tool({
    description: "Get details of a specific account by ID",
    inputSchema: z.object({
      accountId: z.string().describe("Account ID"),
    }),
    execute: async ({ accountId }) => {
      const account = getAccountById(accountId);
      if (!account) return { error: `Account ${accountId} not found` };
      return { account };
    },
  }),

  add_account: tool({
    description: "Add a new financial account",
    inputSchema: z.object({
      name: z.string().describe("Account name"),
      type: z.enum(["checking", "savings", "credit", "investment"]).describe("Account type"),
      balance: z.number().describe("Opening balance"),
      institution: z.string().describe("Financial institution name"),
      color: z.string().default("#10B981").describe("Display color hex code"),
    }),
    execute: async ({ name, type, balance, institution, color }) => {
      const account = addAccount({ name, type, balance, institution, color });
      return { success: true, account };
    },
  }),

  get_account_balance: tool({
    description: "Get the balance of a specific account, or total across all accounts",
    inputSchema: z.object({
      accountId: z.string().optional().describe("Account ID (omit for total balance)"),
    }),
    execute: async ({ accountId }) => {
      if (accountId) {
        const account = getAccountById(accountId);
        if (!account) return { error: `Account ${accountId} not found` };
        return { accountId, name: account.name, balance: account.balance };
      }
      return { totalBalance: getTotalBalance(), accounts: getAccounts().map((a) => ({ id: a.id, name: a.name, balance: a.balance })) };
    },
  }),
};
