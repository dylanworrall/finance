import { Command } from "commander";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { getHomeDir, getDataDir, getPackageRoot } from "../../config/paths.js";
import { hasAnthropicKey, loginFlow } from "../auth.js";
import { printBanner } from "../banner.js";
import { log } from "../../utils/logger.js";

export const uiCommand = new Command("ui")
  .description("Launch the Finance Client web UI")
  .option("-p, --port <port>", "Port to run on", "3000")
  .action(async (opts) => {
    // Ensure data directory exists
    const dataDir = getDataDir();
    await mkdir(dataDir, { recursive: true });

    // Check for API key, run login if missing
    if (!hasAnthropicKey()) {
      log.warn("No Anthropic API key found — starting login flow...");
      const success = await loginFlow();
      if (!success) {
        log.error("Authentication required to start the UI.");
        process.exit(1);
      }
    }

    const uiDir = path.join(getPackageRoot(), "ui");

    const env = {
      ...process.env,
      FINANCE_HOME: getHomeDir(),
      FINANCE_OUTPUT_DIR: dataDir,
    };

    printBanner();
    console.log(`  ${chalk.bold("Dashboard")} ${chalk.dim("→")} ${chalk.cyan(`http://localhost:${opts.port}`)}\n`);

    const child = spawn("npx", ["next", "dev", "-p", opts.port], {
      cwd: uiDir,
      stdio: "inherit",
      shell: true,
      env,
    });

    child.on("error", (err) => {
      log.error(`Failed to start UI: ${err.message}`);
      process.exit(1);
    });

    child.on("exit", (code) => {
      process.exit(code ?? 0);
    });
  });
