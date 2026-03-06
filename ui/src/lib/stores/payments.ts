export type PaymentStatus = "completed" | "pending" | "refunded" | "partial_refund" | "failed";

export interface Payment {
  id: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientName: string;
  clientEmail: string;
  description: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

const payments: Payment[] = [
  {
    id: "PAY-001",
    invoiceId: "INV-001",
    amount: 5000,
    currency: "USD",
    status: "completed",
    clientName: "TechCorp Inc.",
    clientEmail: "billing@techcorp.com",
    description: "Cannabis Consulting - Q1",
    createdAt: "2026-02-15T14:30:00Z",
  },
  {
    id: "PAY-002",
    amount: 1200,
    currency: "USD",
    status: "completed",
    clientName: "Herbal Insights",
    clientEmail: "pay@herbalinsights.com",
    description: "Workshop Registration x4",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "PAY-003",
    amount: 800,
    currency: "USD",
    status: "completed",
    clientName: "GreenPath Dispensary",
    clientEmail: "admin@greenpath.com",
    description: "Monthly Consulting Retainer",
    createdAt: "2026-03-01T08:00:00Z",
  },
];

const refunds: Refund[] = [];

let nextPayId = 4;
let nextRefundId = 1;

export function getPayments(status?: PaymentStatus): Payment[] {
  if (status) return payments.filter((p) => p.status === status);
  return [...payments];
}

export function getPaymentById(id: string): Payment | null {
  return payments.find((p) => p.id === id) ?? null;
}

export function addPayment(data: Omit<Payment, "id" | "createdAt">): Payment {
  const payment: Payment = {
    ...data,
    id: `PAY-${String(nextPayId++).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  payments.push(payment);
  return payment;
}

export function createRefund(data: { paymentId: string; amount: number; reason: string }): Refund | null {
  const payment = payments.find((p) => p.id === data.paymentId);
  if (!payment) return null;

  const refund: Refund = {
    id: `REF-${String(nextRefundId++).padStart(3, "0")}`,
    paymentId: data.paymentId,
    amount: data.amount,
    reason: data.reason,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  refunds.push(refund);

  if (data.amount >= payment.amount) {
    payment.status = "refunded";
  } else {
    payment.status = "partial_refund";
  }

  return refund;
}

export function getRevenue(period: "today" | "week" | "month" | "all"): {
  total: number;
  count: number;
  payments: Payment[];
} {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    }
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "all":
      startDate = new Date(0);
      break;
  }

  const filtered = payments.filter(
    (p) => p.status === "completed" && new Date(p.createdAt) >= startDate
  );
  const total = filtered.reduce((sum, p) => sum + p.amount, 0);

  return { total, count: filtered.length, payments: filtered };
}
