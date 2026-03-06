import { NextRequest, NextResponse } from "next/server";
import { getAccounts, addAccount } from "@/lib/stores/accounts";

export async function GET() {
  const accounts = getAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, type, balance, institution, color } = body;

  if (!name || !type || !institution) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const account = addAccount({ name, type, balance: balance ?? 0, institution, color: color ?? "#10B981" });
  return NextResponse.json({ account });
}
