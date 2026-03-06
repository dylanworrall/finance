export interface ActivityLogEntry {
  id: string;
  type:
    | "invoice_created"
    | "invoice_sent"
    | "invoice_paid"
    | "payment_received"
    | "refund_issued"
    | "product_created"
    | "plan_created"
    | "checkout_created";
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
