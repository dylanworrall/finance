export type BillingPeriod = "one_time" | "weekly" | "monthly" | "yearly";

export interface Product {
  id: string;
  name: string;
  description?: string;
  whopProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  whopPlanId?: string;
  createdAt: string;
}
