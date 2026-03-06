import { NextResponse } from "next/server";
import { loadFinanceEnv, saveFinanceEnvVar } from "@/lib/env";

loadFinanceEnv();

const KEY_NAMES = [
  "ANTHROPIC_API_KEY",
  "WHOP_API_KEY",
  "WHOP_COMPANY_ID",
  "POLAR_ACCESS_TOKEN",
] as const;

type KeyName = (typeof KEY_NAMES)[number];

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return "••••••••" + key.slice(-8);
}

/** GET — return status of all API keys */
export async function GET() {
  loadFinanceEnv(true);

  const statuses: Record<string, { status: string; masked?: string }> = {};

  for (const name of KEY_NAMES) {
    const value = process.env[name];
    if (value) {
      statuses[name] = { status: "connected", masked: maskKey(value) };
    } else {
      statuses[name] = { status: "not_set" };
    }
  }

  return NextResponse.json(statuses);
}

/** POST — validate and save an API key */
export async function POST(req: Request) {
  const { key, value }: { key: KeyName; value: string } = await req.json();

  if (!KEY_NAMES.includes(key)) {
    return NextResponse.json({ error: "Invalid key name" }, { status: 400 });
  }

  if (!value || !value.trim()) {
    return NextResponse.json({ error: "Key value required" }, { status: 400 });
  }

  const trimmed = value.trim();

  // Validate Anthropic key with a test call
  if (key === "ANTHROPIC_API_KEY") {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": trimmed,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (res.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key", status: "invalid" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Could not reach Anthropic API", status: "error" },
        { status: 500 }
      );
    }
  }

  // Save to ~/.finance/.env
  saveFinanceEnvVar(key, trimmed);
  process.env[key] = trimmed;

  return NextResponse.json({
    status: "connected",
    masked: maskKey(trimmed),
  });
}
