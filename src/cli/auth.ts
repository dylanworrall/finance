import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import inquirer from "inquirer";
import open from "open";
import { getHomeDir, getEnvPath } from "../config/paths.js";
import { log } from "../utils/logger.js";

function maskKey(key: string): string {
  if (key.length <= 12) return "****";
  return key.slice(0, 7) + "..." + key.slice(-4);
}

function readEnvFile(): Record<string, string> {
  const envPath = getEnvPath();
  const vars: Record<string, string> = {};
  if (!existsSync(envPath)) return vars;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

function writeEnvFile(vars: Record<string, string>): void {
  const homeDir = getHomeDir();
  if (!existsSync(homeDir)) mkdirSync(homeDir, { recursive: true });
  const envPath = getEnvPath();
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  writeFileSync(envPath, lines.join("\n") + "\n");
}

export function setEnvVar(key: string, value: string): void {
  const vars = readEnvFile();
  vars[key] = value;
  writeEnvFile(vars);
  process.env[key] = value;
}

export function getEnvVar(key: string): string | undefined {
  const vars = readEnvFile();
  return vars[key] || process.env[key] || undefined;
}

async function validateAnthropicKey(key: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    if (res.status === 401) return false;
    return true;
  } catch {
    log.warn("Could not reach Anthropic API — saving key anyway");
    return true;
  }
}

export async function loginFlow(): Promise<boolean> {
  const existing = getEnvVar("ANTHROPIC_API_KEY");
  if (existing) {
    const { reauth } = await inquirer.prompt([{
      type: "confirm",
      name: "reauth",
      message: `API key already set (${maskKey(existing)}). Re-authenticate?`,
      default: false,
    }]);
    if (!reauth) return true;
  }

  const { method } = await inquirer.prompt([{
    type: "list",
    name: "method",
    message: "How would you like to authenticate?",
    choices: [
      { name: "Login with Anthropic Console (opens browser)", value: "browser" },
      { name: "Enter API key directly", value: "paste" },
    ],
  }]);

  if (method === "browser") {
    log.info("Opening Anthropic Console...");
    await open("https://console.anthropic.com/settings/keys");
    log.info("Create or copy your API key from the browser, then paste it below.");
  }

  const { apiKey } = await inquirer.prompt([{
    type: "password",
    name: "apiKey",
    message: "Paste your Anthropic API key:",
    mask: "*",
    validate: (input: string) => {
      if (!input.trim()) return "API key cannot be empty";
      if (!input.startsWith("sk-ant-")) return "Key should start with sk-ant-";
      return true;
    },
  }]);

  const trimmed = apiKey.trim();
  log.info("Validating API key...");

  const valid = await validateAnthropicKey(trimmed);
  if (!valid) {
    log.error("Invalid API key — authentication failed (401)");
    return false;
  }

  setEnvVar("ANTHROPIC_API_KEY", trimmed);
  log.success(`Authenticated! Key: ${maskKey(trimmed)}`);
  return true;
}

export async function whopSetupFlow(): Promise<void> {
  const existingKey = getEnvVar("WHOP_API_KEY");
  const existingCompany = getEnvVar("WHOP_COMPANY_ID");

  if (existingKey && existingCompany) {
    const { reconfigure } = await inquirer.prompt([{
      type: "confirm",
      name: "reconfigure",
      message: `Whop already configured (key: ${maskKey(existingKey)}, company: ${existingCompany}). Reconfigure?`,
      default: false,
    }]);
    if (!reconfigure) return;
  }

  const { setupWhop } = await inquirer.prompt([{
    type: "confirm",
    name: "setupWhop",
    message: "Set up Whop integration? (optional)",
    default: false,
  }]);

  if (!setupWhop) return;

  log.info("Opening Whop Developer Dashboard...");
  await open("https://whop.com/dashboard/developer");

  const answers = await inquirer.prompt([
    {
      type: "password",
      name: "whopKey",
      message: "Whop API key:",
      mask: "*",
      validate: (input: string) => input.trim() ? true : "API key cannot be empty",
    },
    {
      type: "input",
      name: "companyId",
      message: "Whop Company ID:",
      validate: (input: string) => input.trim() ? true : "Company ID cannot be empty",
    },
  ]);

  setEnvVar("WHOP_API_KEY", answers.whopKey.trim());
  setEnvVar("WHOP_COMPANY_ID", answers.companyId.trim());
  log.success(`Whop configured! Company: ${answers.companyId.trim()}`);
}

export async function polarSetupFlow(): Promise<void> {
  const existingToken = getEnvVar("POLAR_ACCESS_TOKEN");

  if (existingToken) {
    const { reconfigure } = await inquirer.prompt([{
      type: "confirm",
      name: "reconfigure",
      message: `Polar.sh already configured (token: ${maskKey(existingToken)}). Reconfigure?`,
      default: false,
    }]);
    if (!reconfigure) return;
  }

  const { setupPolar } = await inquirer.prompt([{
    type: "confirm",
    name: "setupPolar",
    message: "Set up Polar.sh integration? (optional)",
    default: false,
  }]);

  if (!setupPolar) return;

  log.info("Opening Polar.sh settings...");
  await open("https://polar.sh/settings");

  const { token } = await inquirer.prompt([{
    type: "password",
    name: "token",
    message: "Polar.sh access token:",
    mask: "*",
    validate: (input: string) => input.trim() ? true : "Token cannot be empty",
  }]);

  setEnvVar("POLAR_ACCESS_TOKEN", token.trim());
  log.success(`Polar.sh configured! Token: ${maskKey(token.trim())}`);
}

export function hasAnthropicKey(): boolean {
  return !!getEnvVar("ANTHROPIC_API_KEY");
}
