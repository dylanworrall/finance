export type AgentMode = "auto" | "draft" | "manual";

export interface AgentModes {
  create_invoice: AgentMode;
  list_invoices: AgentMode;
  get_invoice: AgentMode;
  send_invoice: AgentMode;
  list_payments: AgentMode;
  get_payment: AgentMode;
  create_refund: AgentMode;
  get_revenue: AgentMode;
  create_product: AgentMode;
  list_products: AgentMode;
  create_plan: AgentMode;
  list_plans: AgentMode;
  create_checkout_link: AgentMode;
  list_checkouts: AgentMode;
  polar_list_products: AgentMode;
  polar_create_product: AgentMode;
  polar_create_checkout: AgentMode;
  polar_list_orders: AgentMode;
  polar_list_subscriptions: AgentMode;
  polar_list_customers: AgentMode;
  get_settings: AgentMode;
}

export interface FinanceConfig {
  anthropicApiKey: string;
  anthropicModel: string;
  whopApiKey: string;
  whopCompanyId: string;
  agentModes: AgentModes;
}
