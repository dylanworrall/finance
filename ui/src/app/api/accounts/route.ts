import { NextRequest, NextResponse } from "next/server";
import { getAccounts, addAccount } from "@/lib/stores/accounts";
import { getConvexClient, isConvexMode } from "@/lib/convex-server";
import { api } from "@/lib/convex-api";

export async function GET() {
  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const accounts = await convex.query(api.accounts.list, {});
    return NextResponse.json({ accounts });
  }
  const accounts = getAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, type, balance, institution, color } = body;

  if (!name || !type || !institution) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (isConvexMode()) {
    const convex = getConvexClient()!;
    const id = await convex.mutation(api.accounts.add, { name, type, balance: balance ?? 0, institution, color: color ?? "#10B981" });
    return NextResponse.json({ account: { _id: id, name, type, balance: balance ?? 0, institution, color: color ?? "#10B981" } });
  }

  const account = addAccount({ name, type, balance: balance ?? 0, institution, color: color ?? "#10B981" });
  return NextResponse.json({ account });
}
