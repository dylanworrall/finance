import { tool } from "ai";
import { z } from "zod";
import { addActivity } from "@/lib/stores/activity";

function getPolarClient() {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) return null;
  // Dynamic import to avoid errors when not configured
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Polar } = require("@polar-sh/sdk");
    return new Polar({ accessToken: token }) as PolarClient;
  } catch {
    throw new Error("Polar SDK not installed. Run: npm install @polar-sh/sdk");
  }
}

interface PolarClient {
  products: {
    list: (params: Record<string, unknown>) => Promise<AsyncIterable<{ result: PolarProduct[] }>>;
    create: (params: Record<string, unknown>) => Promise<PolarProduct>;
  };
  checkouts: {
    sessions: {
      list: (params: Record<string, unknown>) => Promise<AsyncIterable<{ result: PolarCheckout[] }>>;
      create: (params: Record<string, unknown>) => Promise<PolarCheckout>;
    };
  };
  orders: {
    list: (params: Record<string, unknown>) => Promise<AsyncIterable<{ result: PolarOrder[] }>>;
    get: (params: { id: string }) => Promise<PolarOrder>;
  };
  subscriptions: {
    list: (params: Record<string, unknown>) => Promise<AsyncIterable<{ result: PolarSubscription[] }>>;
  };
  customers: {
    list: (params: Record<string, unknown>) => Promise<AsyncIterable<{ result: PolarCustomer[] }>>;
    create: (params: Record<string, unknown>) => Promise<PolarCustomer>;
  };
}

interface PolarProduct {
  id: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  prices: Array<{
    id: string;
    amountType: string;
    priceAmount: number;
    priceCurrency: string;
    recurringInterval: string | null;
  }>;
  createdAt: string;
}

interface PolarCheckout {
  id: string;
  url: string;
  status: string;
  amount: number;
  currency: string;
  productId: string;
  createdAt: string;
}

interface PolarOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  productId: string;
  customerId: string;
  createdAt: string;
}

interface PolarSubscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  productId: string;
  customerId: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  createdAt: string;
}

interface PolarCustomer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export const polarTools = {
  polar_list_products: tool({
    description:
      "List all products on Polar. Requires POLAR_ACCESS_TOKEN env var.",
    inputSchema: z.object({}),
    execute: async () => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const products: PolarProduct[] = [];
        const result = await polar.products.list({});
        for await (const page of result) {
          products.push(...(page.result ?? []));
        }

        if (products.length === 0) {
          return "No products found on Polar";
        }

        const lines = products.map((p) => {
          const prices = p.prices
            .map((pr) => {
              const amount = (pr.priceAmount / 100).toLocaleString();
              const interval = pr.recurringInterval ? `/${pr.recurringInterval}` : " one-time";
              return `$${amount}${interval}`;
            })
            .join(", ");
          return `- ${p.name} (${p.id}): ${prices}${p.isArchived ? " [archived]" : ""}`;
        });

        return `${products.length} Polar product(s):\n${lines.join("\n")}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),

  polar_create_product: tool({
    description:
      "Create a new product on Polar with a price. Requires POLAR_ACCESS_TOKEN.",
    inputSchema: z.object({
      name: z.string().describe("Product name"),
      description: z.string().default("").describe("Product description"),
      priceAmount: z.number().describe("Price in dollars (e.g. 49.99)"),
      recurringInterval: z
        .enum(["month", "year"])
        .default("month")
        .describe("Billing interval for subscriptions, or omit for one-time"),
      isRecurring: z.boolean().default(false).describe("Whether this is a subscription product"),
    }),
    execute: async ({ name, description, priceAmount, recurringInterval, isRecurring }) => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const priceInCents = Math.round(priceAmount * 100);
        const prices = isRecurring
          ? [{ amountType: "fixed" as const, priceAmount: priceInCents, priceCurrency: "usd", recurringInterval }]
          : [{ amountType: "fixed" as const, priceAmount: priceInCents, priceCurrency: "usd" }];

        const product = await polar.products.create({
          name,
          description: description || undefined,
          prices,
        });

        addActivity(
          "product_created",
          `Polar product "${product.name}" created (${product.id}) — $${priceAmount}`,
          { provider: "polar", productId: product.id }
        );

        return `Polar product "${product.name}" created (${product.id})\nPrice: $${priceAmount}${isRecurring ? `/${recurringInterval}` : " one-time"}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),

  polar_create_checkout: tool({
    description:
      "Create a Polar checkout session for a product. Returns a payment URL. Requires POLAR_ACCESS_TOKEN.",
    inputSchema: z.object({
      productPriceId: z.string().describe("Polar product price ID"),
      customerEmail: z.string().default("").describe("Customer email to prefill"),
      successUrl: z.string().default("").describe("Redirect URL after successful payment"),
    }),
    execute: async ({ productPriceId, customerEmail, successUrl }) => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const checkout = await polar.checkouts.sessions.create({
          productPriceId,
          customerEmail: customerEmail || undefined,
          successUrl: successUrl || undefined,
        });

        addActivity(
          "checkout_created",
          `Polar checkout created — ${checkout.url}`,
          { provider: "polar", checkoutId: checkout.id }
        );

        return `Polar checkout created!\n\nURL: ${checkout.url}\nCheckout ID: ${checkout.id}\nStatus: ${checkout.status}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),

  polar_list_orders: tool({
    description:
      "List recent orders/payments from Polar. Requires POLAR_ACCESS_TOKEN.",
    inputSchema: z.object({}),
    execute: async () => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const orders: PolarOrder[] = [];
        const result = await polar.orders.list({});
        for await (const page of result) {
          orders.push(...(page.result ?? []));
        }

        if (orders.length === 0) {
          return "No orders found on Polar";
        }

        const total = orders.reduce((sum, o) => sum + o.amount, 0) / 100;
        const lines = orders.map((o) => {
          const amount = (o.amount / 100).toLocaleString();
          return `- ${o.id}: $${amount} ${o.currency.toUpperCase()} (${o.status}) — ${new Date(o.createdAt).toLocaleDateString()}`;
        });

        return `${orders.length} Polar order(s) — total: $${total.toLocaleString()}\n${lines.join("\n")}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),

  polar_list_subscriptions: tool({
    description:
      "List active subscriptions from Polar. Requires POLAR_ACCESS_TOKEN.",
    inputSchema: z.object({}),
    execute: async () => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const subs: PolarSubscription[] = [];
        const result = await polar.subscriptions.list({});
        for await (const page of result) {
          subs.push(...(page.result ?? []));
        }

        if (subs.length === 0) {
          return "No subscriptions found on Polar";
        }

        const mrr = subs
          .filter((s) => s.status === "active")
          .reduce((sum, s) => sum + s.amount, 0) / 100;

        const lines = subs.map((s) => {
          const amount = (s.amount / 100).toLocaleString();
          return `- ${s.id}: $${amount}/${s.recurringInterval} (${s.status}) — since ${new Date(s.createdAt).toLocaleDateString()}`;
        });

        return `${subs.length} Polar subscription(s) — MRR: $${mrr.toLocaleString()}\n${lines.join("\n")}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),

  polar_list_customers: tool({
    description:
      "List customers from Polar. Requires POLAR_ACCESS_TOKEN.",
    inputSchema: z.object({}),
    execute: async () => {
      const polar = getPolarClient();
      if (!polar) {
        return "Polar not configured — set POLAR_ACCESS_TOKEN environment variable";
      }

      try {
        const customers: PolarCustomer[] = [];
        const result = await polar.customers.list({});
        for await (const page of result) {
          customers.push(...(page.result ?? []));
        }

        if (customers.length === 0) {
          return "No customers found on Polar";
        }

        const lines = customers.map((c) =>
          `- ${c.name ?? "No name"} (${c.email}) — joined ${new Date(c.createdAt).toLocaleDateString()}`
        );

        return `${customers.length} Polar customer(s):\n${lines.join("\n")}`;
      } catch (err) {
        return `Polar API error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),
};
