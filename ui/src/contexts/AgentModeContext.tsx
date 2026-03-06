"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type AgentMode = "auto" | "draft" | "manual";

interface AgentModeContextValue {
  modes: Record<string, AgentMode>;
  setMode: (tool: string, mode: AgentMode) => void;
}

const AgentModeContext = createContext<AgentModeContextValue | null>(null);

const DEFAULT_MODES: Record<string, AgentMode> = {
  // Invoices
  create_invoice: "draft",
  list_invoices: "auto",
  get_invoice: "auto",
  send_invoice: "draft",
  // Payments
  list_payments: "auto",
  get_payment: "auto",
  create_refund: "draft",
  get_revenue: "auto",
  // Products
  create_product: "draft",
  list_products: "auto",
  create_plan: "draft",
  list_plans: "auto",
  // Checkout
  create_checkout_link: "auto",
  list_checkouts: "auto",
  // Polar
  polar_list_products: "auto",
  polar_create_product: "draft",
  polar_create_checkout: "auto",
  polar_list_orders: "auto",
  polar_list_subscriptions: "auto",
  polar_list_customers: "auto",
  // Settings
  get_settings: "auto",
  // Transactions
  list_transactions: "auto",
  add_transaction: "draft",
  categorize_transaction: "draft",
  search_transactions: "auto",
  get_transaction: "auto",
  // Accounts
  list_accounts: "auto",
  get_account: "auto",
  add_account: "draft",
  get_account_balance: "auto",
  // Reports
  generate_report: "draft",
  list_reports: "auto",
  get_report: "auto",
  export_report: "auto",
  // Budgets
  get_budget_status: "auto",
  set_budget: "draft",
  check_spending: "auto",
  // Analytics
  monthly_summary: "auto",
  category_breakdown: "auto",
  cash_flow_analysis: "auto",
  compare_periods: "auto",
  // Spaces
  list_spaces: "auto",
  get_space: "auto",
  create_space: "draft",
};

export function AgentModeProvider({ children }: { children: ReactNode }) {
  const [modes, setModes] = useState<Record<string, AgentMode>>(DEFAULT_MODES);

  const setMode = useCallback((tool: string, mode: AgentMode) => {
    setModes((prev) => ({ ...prev, [tool]: mode }));
  }, []);

  return (
    <AgentModeContext value={{ modes, setMode }}>
      {children}
    </AgentModeContext>
  );
}

export function useAgentMode(): AgentModeContextValue {
  const ctx = useContext(AgentModeContext);
  if (!ctx) throw new Error("useAgentMode must be used within AgentModeProvider");
  return ctx;
}
