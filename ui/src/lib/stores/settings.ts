export type AgentMode = "auto" | "draft" | "manual";

export interface Settings {
  agentModes: Record<string, AgentMode>;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  anthropicModel: string;
}

const settings: Settings = {
  agentModes: {
    create_invoice: "draft",
    list_invoices: "auto",
    get_invoice: "auto",
    send_invoice: "draft",
    list_payments: "auto",
    get_payment: "auto",
    create_refund: "draft",
    get_revenue: "auto",
    create_product: "draft",
    list_products: "auto",
    create_plan: "draft",
    list_plans: "auto",
    create_checkout_link: "auto",
    list_checkouts: "auto",
    polar_list_products: "auto",
    polar_create_product: "draft",
    polar_create_checkout: "auto",
    polar_list_orders: "auto",
    polar_list_subscriptions: "auto",
    polar_list_customers: "auto",
    get_settings: "auto",
    list_transactions: "auto",
    add_transaction: "draft",
    categorize_transaction: "draft",
    search_transactions: "auto",
    get_transaction: "auto",
    list_accounts: "auto",
    get_account: "auto",
    add_account: "draft",
    get_account_balance: "auto",
    generate_report: "draft",
    list_reports: "auto",
    get_report: "auto",
    export_report: "auto",
    get_budget_status: "auto",
    set_budget: "draft",
    check_spending: "auto",
    monthly_summary: "auto",
    category_breakdown: "auto",
    cash_flow_analysis: "auto",
    compare_periods: "auto",
    list_spaces: "auto",
    get_space: "auto",
    create_space: "draft",
  },
  businessName: "",
  businessEmail: "you@example.com",
  businessAddress: "",
  defaultCurrency: "USD",
  defaultTaxRate: 0,
  anthropicModel: "claude-sonnet-4-20250514",
};

export function getSettings(): Settings {
  return { ...settings, agentModes: { ...settings.agentModes } };
}

export function updateSettings(updates: Partial<Settings>): Settings {
  if (updates.agentModes) {
    Object.assign(settings.agentModes, updates.agentModes);
  }
  if (updates.businessName !== undefined) settings.businessName = updates.businessName;
  if (updates.businessEmail !== undefined) settings.businessEmail = updates.businessEmail;
  if (updates.businessAddress !== undefined) settings.businessAddress = updates.businessAddress;
  if (updates.defaultCurrency !== undefined) settings.defaultCurrency = updates.defaultCurrency;
  if (updates.defaultTaxRate !== undefined) settings.defaultTaxRate = updates.defaultTaxRate;
  if (updates.anthropicModel) settings.anthropicModel = updates.anthropicModel;
  return getSettings();
}
