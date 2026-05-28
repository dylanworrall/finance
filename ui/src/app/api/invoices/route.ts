import { NextResponse } from "next/server";
import { getInvoices, createInvoice } from "@/lib/stores/invoices";
import { getConvexClient, isConvexMode } from "@/lib/convex-server";
import { api } from "@/lib/convex-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "draft"
    | "sent"
    | "paid"
    | "overdue"
    | "cancelled"
    | null;

  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const invoices = await convex.query(api.invoices.list, { status: status ?? undefined });
    return NextResponse.json({ invoices });
  }

  const invoices = getInvoices(status ?? undefined);
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const id = await convex.mutation(api.invoices.create, body);
    return NextResponse.json({ invoice: { _id: id } });
  }

  const invoice = createInvoice(body);
  return NextResponse.json({ invoice });
}
