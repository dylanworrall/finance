import { NextResponse } from "next/server";
import { getInvoices, createInvoice } from "@/lib/stores/invoices";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "cancelled"
    | null;
  const invoices = getInvoices(status ?? undefined);
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const body = await req.json();
  const invoice = createInvoice(body);
  return NextResponse.json({ invoice });
}
