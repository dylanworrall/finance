export type BillingPeriod = "one_time" | "weekly" | "monthly" | "yearly";

export interface Product {
  id: string;
  name: string;
  description?: string;
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
  createdAt: string;
}

const products: Product[] = [
  {
    id: "PROD-001",
    name: "Cannabis Consulting",
    description: "Full-service cannabis business consulting including compliance, licensing, and strategy",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "PROD-002",
    name: "Compliance Workshop",
    description: "Group workshop covering state and federal cannabis compliance requirements",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-02-01T08:00:00Z",
  },
];

const plans: Plan[] = [
  {
    id: "PLAN-001",
    productId: "PROD-001",
    name: "One-Time Consulting Package",
    price: 5000,
    currency: "USD",
    billingPeriod: "one_time",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "PLAN-002",
    productId: "PROD-001",
    name: "Monthly Retainer",
    price: 2000,
    currency: "USD",
    billingPeriod: "monthly",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "PLAN-003",
    productId: "PROD-002",
    name: "Workshop Registration",
    price: 300,
    currency: "USD",
    billingPeriod: "one_time",
    createdAt: "2026-02-01T08:00:00Z",
  },
];

let nextProdId = 3;
let nextPlanId = 4;

export function createProduct(data: { name: string; description?: string }): Product {
  const product: Product = {
    id: `PROD-${String(nextProdId++).padStart(3, "0")}`,
    name: data.name,
    description: data.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(product);
  return product;
}

export function getProducts(): Product[] {
  return [...products];
}

export function getProductById(id: string): Product | null {
  return products.find((p) => p.id === id) ?? null;
}

export function createPlan(data: {
  productId: string;
  name: string;
  price: number;
  currency?: string;
  billingPeriod: BillingPeriod;
}): Plan | null {
  const product = products.find((p) => p.id === data.productId);
  if (!product) return null;

  const plan: Plan = {
    id: `PLAN-${String(nextPlanId++).padStart(3, "0")}`,
    productId: data.productId,
    name: data.name,
    price: data.price,
    currency: data.currency ?? "USD",
    billingPeriod: data.billingPeriod,
    createdAt: new Date().toISOString(),
  };
  plans.push(plan);
  return plan;
}

export function getPlans(productId?: string): Plan[] {
  if (productId) return plans.filter((p) => p.productId === productId);
  return [...plans];
}
