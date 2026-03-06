export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  whopCheckoutId?: string;
  paymentLink?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}
