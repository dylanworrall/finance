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
  whopPaymentId?: string;
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

export interface Payout {
  id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}
