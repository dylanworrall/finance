import { NextRequest, NextResponse } from "next/server";
import { getBudgets, addBudget } from "@/lib/stores/budgets";

export async function GET() {
  const budgets = getBudgets();
  return NextResponse.json({ budgets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, limit, period } = body;

  if (!category || !limit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const budget = addBudget({ category, limit, spent: 0, period: period ?? "monthly" });
  return NextResponse.json({ budget });
}
