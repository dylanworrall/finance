import { NextRequest, NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/lib/stores/transactions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const accountId = url.searchParams.get("accountId") ?? undefined;
  const startDate = url.searchParams.get("startDate") ?? undefined;
  const endDate = url.searchParams.get("endDate") ?? undefined;

  const transactions = getTransactions({ type, category, accountId, startDate, endDate });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, amount, category, description, accountId, date } = body;

  if (!type || !amount || !category || !description || !accountId || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transaction = addTransaction({ type, amount, category, description, accountId, date });
  return NextResponse.json({ transaction });
}
