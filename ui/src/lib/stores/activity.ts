export interface ActivityEntry {
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

const activity: ActivityEntry[] = [
  {
    id: "1",
    type: "payment_received",
    summary: "Received $5,000 from TechCorp Inc. for Cannabis Consulting - Q1",
    timestamp: "2026-02-15T14:30:00Z",
  },
  {
    id: "2",
    type: "invoice_sent",
    summary: "Invoice INV-002 sent to GreenLeaf Partners for $4,000",
    timestamp: "2026-03-01T09:00:00Z",
  },
  {
    id: "3",
    type: "payment_received",
    summary: "Received $1,200 from Herbal Insights for Workshop Registration",
    timestamp: "2026-02-20T10:00:00Z",
  },
];

let nextId = 4;

export function addActivity(
  type: ActivityEntry["type"],
  summary: string,
  metadata?: Record<string, unknown>
): ActivityEntry {
  const entry: ActivityEntry = {
    id: String(nextId++),
    type,
    summary,
    timestamp: new Date().toISOString(),
    metadata,
  };
  activity.unshift(entry);
  return entry;
}

export function getActivity(limit = 20): ActivityEntry[] {
  return activity.slice(0, limit);
}
