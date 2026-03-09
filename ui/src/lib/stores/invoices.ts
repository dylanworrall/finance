import { soshiEvents } from '../../../../src/events/emitter.js';

// TODO: emit 'invoice_overdue' when periodic overdue checking is implemented

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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
  paymentLink?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

const invoices: Invoice[] = [
  {
    id: "INV-001",
    clientName: "TechCorp Inc.",
    clientEmail: "billing@techcorp.com",
    lineItems: [
      { description: "Cannabis Consulting - Q1", quantity: 1, unitPrice: 5000, total: 5000 },
    ],
    subtotal: 5000,
    taxRate: 0,
    taxAmount: 0,
    total: 5000,
    status: "paid",
    dueDate: "2026-02-28",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-15T14:30:00Z",
    paidAt: "2026-02-15T14:30:00Z",
  },
  {
    id: "INV-002",
    clientName: "GreenLeaf Partners",
    clientEmail: "ap@greenleaf.co",
    lineItems: [
      { description: "Compliance Review", quantity: 1, unitPrice: 2500, total: 2500 },
      { description: "License Application Support", quantity: 1, unitPrice: 1500, total: 1500 },
    ],
    subtotal: 4000,
    taxRate: 0,
    taxAmount: 0,
    total: 4000,
    status: "sent",
    dueDate: "2026-03-15",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "INV-003",
    clientName: "CannaVentures LLC",
    clientEmail: "john@cannaventures.com",
    lineItems: [
      { description: "Market Analysis Report", quantity: 1, unitPrice: 3000, total: 3000 },
    ],
    subtotal: 3000,
    taxRate: 0,
    taxAmount: 0,
    total: 3000,
    status: "overdue",
    dueDate: "2026-02-20",
    createdAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-02-05T08:00:00Z",
  },
];

let nextNum = 4;

export function createInvoice(data: {
  clientName: string;
  clientEmail: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  taxRate?: number;
  dueDate: string;
  notes?: string;
}): Invoice {
  const lineItems = data.lineItems.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = data.taxRate ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const invoice: Invoice = {
    id: `INV-${String(nextNum++).padStart(3, "0")}`,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    status: "draft",
    dueDate: data.dueDate,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  invoices.push(invoice);
  soshiEvents.emit('invoice_created', { invoiceId: invoice.id, clientName: invoice.clientName, amount: invoice.total, currency: 'USD' });
  return invoice;
}

export function getInvoices(status?: InvoiceStatus): Invoice[] {
  if (status) return invoices.filter((inv) => inv.status === status);
  return [...invoices];
}

export function getInvoiceById(id: string): Invoice | null {
  return invoices.find((inv) => inv.id === id) ?? null;
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus): Invoice | null {
  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) return null;
  invoice.status = status;
  invoice.updatedAt = new Date().toISOString();
  if (status === "paid") invoice.paidAt = new Date().toISOString();
  return invoice;
}

export function updateInvoicePaymentLink(id: string, paymentLink: string): Invoice | null {
  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) return null;
  invoice.paymentLink = paymentLink;
  invoice.updatedAt = new Date().toISOString();
  return invoice;
}
