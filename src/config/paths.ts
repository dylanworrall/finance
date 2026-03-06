import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

/** Root of user data: FINANCE_HOME env or ~/.finance/ */
export function getHomeDir(): string {
  return process.env.FINANCE_HOME || path.join(homedir(), ".finance");
}

/** Alias matching ClipBot naming convention */
export const getFinanceHome = getHomeDir;

export function getConfigPath(): string {
  return path.join(getHomeDir(), "config.json");
}

export function getDataDir(): string {
  return path.join(getHomeDir(), "data");
}

export function getEnvPath(): string {
  return path.join(getHomeDir(), ".env");
}

/** Resolve the npm package root (where package.json lives) */
export function getPackageRoot(): string {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "..", "..");
}
