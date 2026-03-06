import { tool } from "ai";
import { z } from "zod";
import {
  createProduct as storeCreateProduct,
  getProducts,
  createPlan as storeCreatePlan,
  getPlans,
} from "@/lib/stores/products";
import { addActivity } from "@/lib/stores/activity";

export const productTools = {
  create_product: tool({
    description: "Create a new product or service.",
    inputSchema: z.object({
      name: z.string().describe("Product name"),
      description: z.string().default("").describe("Product description"),
    }),
    execute: async ({ name, description }) => {
      const product = storeCreateProduct({ name, description: description || undefined });

      addActivity(
        "product_created",
        `Product "${product.name}" created (${product.id})`,
        { productId: product.id }
      );

      return {
        message: `Product "${product.name}" created (${product.id})`,
        product,
      };
    },
  }),

  list_products: tool({
    description: "List all products and services",
    inputSchema: z.object({}),
    execute: async () => {
      const products = getProducts();
      return {
        message: `${products.length} product(s)`,
        products,
      };
    },
  }),

  create_plan: tool({
    description: "Create a pricing plan for an existing product.",
    inputSchema: z.object({
      productId: z.string().describe("Product ID to attach the plan to"),
      name: z.string().describe("Plan name (e.g. 'Monthly Retainer')"),
      price: z.number().describe("Price in dollars"),
      currency: z.string().default("USD").describe("Currency code"),
      billingPeriod: z
        .enum(["one_time", "weekly", "monthly", "yearly"])
        .describe("Billing period"),
    }),
    execute: async ({ productId, name, price, currency, billingPeriod }) => {
      const plan = storeCreatePlan({ productId, name, price, currency, billingPeriod });
      if (!plan) {
        return `Product ${productId} not found — cannot create plan`;
      }

      addActivity(
        "plan_created",
        `Plan "${plan.name}" created — $${plan.price.toLocaleString()}/${plan.billingPeriod} (${plan.id})`,
        { planId: plan.id, productId }
      );

      return `Plan "${plan.name}" created — $${plan.price.toLocaleString()}/${plan.billingPeriod} (${plan.id})`;
    },
  }),

  list_plans: tool({
    description: "List all pricing plans, optionally filtered by product",
    inputSchema: z.object({
      productId: z.string().default("").describe("Filter by product ID (leave empty for all)"),
    }),
    execute: async ({ productId }) => {
      const plans = getPlans(productId || undefined);
      return {
        message: `${plans.length} plan(s)`,
        plans,
      };
    },
  }),
};
