import { NextRequest, NextResponse } from "next/server";
import { getReports, addReport } from "@/lib/stores/reports";
import { getTransactions } from "@/lib/stores/transactions";
import { getConvexClient, isConvexMode } from "@/lib/convex-server";
import { api } from "@/lib/convex-api";

export async function GET() {
  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const reports = await convex.query(api.reports.list, {});
    return NextResponse.json({ reports });
  }
  const reports = getReports();
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, title, startDate, endDate } = body;

  if (!type || !title || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const txns = getTransactions({ startDate, endDate });
  const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  let data: Record<string, unknown> = {};
  if (type === "monthly_summary") {
    data = { totalIncome: income, totalExpenses: expenses, netIncome: income - expenses, transactionCount: txns.length };
  } else if (type === "category_breakdown") {
    const byCategory: Record<string, number> = {};
    txns.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + (t.type === "expense" ? -t.amount : t.amount);
    });
    data = { categories: Object.entries(byCategory).map(([name, total]) => ({ name, total })) };
  } else if (type === "cash_flow") {
    data = { inflow: income, outflow: expenses, net: income - expenses, transactionCount: txns.length };
  } else {
    data = { totalIncome: income, totalDeductions: expenses, taxableIncome: income - expenses };
  }

  const report = addReport({ type, title, dateRange: { start: startDate, end: endDate }, data });
  return NextResponse.json({ report });
}
