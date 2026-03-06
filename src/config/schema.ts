import { z } from "zod";

const AgentModeSchema = z.enum(["auto", "draft", "manual"]);

const AgentModesSchema = z.object({
  create_invoice: AgentModeSchema,
  list_invoices: AgentModeSchema,
  get_invoice: AgentModeSchema,
  send_invoice: AgentModeSchema,
  list_payments: AgentModeSchema,
  get_payment: AgentModeSchema,
  create_refund: AgentModeSchema,
  get_revenue: AgentModeSchema,
  create_product: AgentModeSchema,
  list_products: AgentModeSchema,
  create_plan: AgentModeSchema,
  list_plans: AgentModeSchema,
  create_checkout_link: AgentModeSchema,
  list_checkouts: AgentModeSchema,
  polar_list_products: AgentModeSchema,
  polar_create_product: AgentModeSchema,
  polar_create_checkout: AgentModeSchema,
  polar_list_orders: AgentModeSchema,
  polar_list_subscriptions: AgentModeSchema,
  polar_list_customers: AgentModeSchema,
  get_settings: AgentModeSchema,
}).partial();

export const ConfigFileSchema = z.object({
  anthropicModel: z.string().optional(),
  whopCompanyId: z.string().optional(),
  agentModes: AgentModesSchema.optional(),
});

export type ConfigFile = z.infer<typeof ConfigFileSchema>;
