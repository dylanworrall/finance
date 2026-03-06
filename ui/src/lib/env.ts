import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

let loaded = false;

function getEnvPath(): string {
  return join(homedir(), ".finance", ".env");
}

function readEnvFile(): Record<string, string> {
  const envPath = getEnvPath();
  const vars: Record<string, string> = {};
  if (!existsSync(envPath)) return vars;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

/**
 * Load env vars from ~/.finance/.env into process.env.
 * Does not override already-set vars unless force=true.
 */
/** Keys managed by the finance env file */
const MANAGED_KEYS = ["ANTHROPIC_API_KEY", "CLAUDE_OAUTH_TOKEN", "WHOP_API_KEY", "WHOP_COMPANY_ID", "POLAR_ACCESS_TOKEN"];

export function loadFinanceEnv(force = false): void {
  if (loaded && !force) return;
  loaded = true;

  const vars = readEnvFile();

  if (force) {
    // Remove managed keys that are no longer in the file
    for (const key of MANAGED_KEYS) {
      if (!(key in vars)) {
        delete process.env[key];
      }
    }
  }

  for (const [key, value] of Object.entries(vars)) {
    if (force || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

/**
 * Save a key=value to ~/.finance/.env (creates dir if needed).
 */
export function saveFinanceEnvVar(key: string, value: string): void {
  const dir = join(homedir(), ".finance");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const vars = readEnvFile();
  vars[key] = value;

  const envPath = getEnvPath();
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  writeFileSync(envPath, lines.join("\n") + "\n");
}
