import { NextRequest, NextResponse } from "next/server";
import { getBudgets, addBudget } from "@/lib/stores/budgets";
import { getConvexClient, isConvexMode } from "@/lib/convex-server";
import { api } from "@/lib/convex-api";

export async function GET() {
  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const budgets = await convex.query(api.budgets.list, {});
    return NextResponse.json({ budgets });
  }
  const budgets = getBudgets();
  return NextResponse.json({ budgets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, limit, period } = body;

  if (!category || !limit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const id = await convex.mutation(api.budgets.add, { category, limit, spent: 0, period: period ?? "monthly" });
    return NextResponse.json({ budget: { _id: id, category, limit, spent: 0, period: period ?? "monthly" } });
  }

  const budget = addBudget({ category, limit, spent: 0, period: period ?? "monthly" });
  return NextResponse.json({ budget });
}
