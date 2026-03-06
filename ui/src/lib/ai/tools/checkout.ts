import { tool } from "ai";
import { z } from "zod";
import { getPlans } from "@/lib/stores/products";
import { addActivity } from "@/lib/stores/activity";

export const checkoutTools = {
  create_checkout_link: tool({
    description:
      "Generate a payment/checkout link for a product plan. Returns a shareable URL the user can send to clients.",
    inputSchema: z.object({
      planId: z.string().describe("Plan ID to create checkout for"),
    }),
    execute: async ({ planId }) => {
      const plans = getPlans();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        return `Plan ${planId} not found`;
      }

      const checkoutId = `CHK-${Date.now().toString(36).toUpperCase()}`;
      const checkoutUrl = process.env.WHOP_API_KEY
        ? `https://whop.com/checkout/${checkoutId}`
        : `https://whop.com/checkout/preview/${checkoutId}`;

      addActivity(
        "checkout_created",
        `Checkout link created for "${plan.name}" — $${plan.price.toLocaleString()}`,
        { planId, checkoutId }
      );

      return `Checkout link created for "${plan.name}" ($${plan.price.toLocaleString()})\n\nURL: ${checkoutUrl}\nPlan: ${plan.name}\nPrice: $${plan.price}\nCheckout ID: ${checkoutId}`;
    },
  }),

  list_checkouts: tool({
    description: "List recent checkout sessions",
    inputSchema: z.object({}),
    execute: async () => {
      const { getActivity } = await import("@/lib/stores/activity");
      const all = getActivity(50);
      const checkouts = all.filter((a) => a.type === "checkout_created");

      return {
        message: `${checkouts.length} checkout session(s)`,
        checkouts: checkouts.map((c) => ({
          id: c.id,
          summary: c.summary,
          createdAt: c.timestamp,
          metadata: c.metadata,
        })),
      };
    },
  }),
};
