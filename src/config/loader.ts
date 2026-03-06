import { readFile } from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import type { FinanceConfig } from "../types/index.js";
import { ConfigFileSchema } from "./schema.js";
import { DEFAULT_CONFIG } from "./defaults.js";
import { getEnvPath } from "./paths.js";
import { log } from "../utils/logger.js";

const homeEnvPath = getEnvPath();
if (existsSync(homeEnvPath)) {
  loadEnv({ path: homeEnvPath });
}
loadEnv();

async function tryLoadJson(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = ConfigFileSchema.parse(parsed);
    log.debug(`Loaded config from ${filePath}`);
    return validated as Record<string, unknown>;
  } catch {
    return null;
  }
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined && value !== null) {
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof (result as Record<string, unknown>)[key] === "object" &&
        !Array.isArray((result as Record<string, unknown>)[key])
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          (result as Record<string, unknown>)[key] as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  return result;
}

export async function loadConfig(cliConfigPath?: string): Promise<FinanceConfig> {
  let config = {
    ...DEFAULT_CONFIG,
    agentModes: { ...DEFAULT_CONFIG.agentModes },
  } as Record<string, unknown>;

  // 1. User home config
  const homeConfig = await tryLoadJson(
    path.join(homedir(), ".finance", "config.json")
  );
  if (homeConfig) config = deepMerge(config, homeConfig);

  // 2. Local config
  const localConfig = await tryLoadJson(
    path.join(process.cwd(), "finance.config.json")
  );
  if (localConfig) config = deepMerge(config, localConfig);

  // 3. Explicit CLI path
  if (cliConfigPath) {
    const cliConfig = await tryLoadJson(cliConfigPath);
    if (cliConfig) config = deepMerge(config, cliConfig);
  }

  // 4. Environment variable overrides
  if (process.env.ANTHROPIC_API_KEY) config.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (process.env.WHOP_API_KEY) config.whopApiKey = process.env.WHOP_API_KEY;
  if (process.env.WHOP_COMPANY_ID) config.whopCompanyId = process.env.WHOP_COMPANY_ID;
  if (process.env.POLAR_ACCESS_TOKEN) config.polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
  if (process.env.ANTHROPIC_MODEL) config.anthropicModel = process.env.ANTHROPIC_MODEL;

  return config as unknown as FinanceConfig;
}
