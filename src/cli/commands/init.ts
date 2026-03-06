import { Command } from "commander";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import chalk from "chalk";
import { getHomeDir, getConfigPath, getDataDir, getEnvPath } from "../../config/paths.js";
import { DEFAULT_CONFIG } from "../../config/defaults.js";
import { loginFlow, whopSetupFlow, polarSetupFlow } from "../auth.js";
import { printBanner } from "../banner.js";

export const initCommand = new Command("init")
  .description("Set up Finance Client — creates ~/.finance/ with config, API keys, and data directories")
  .option("-y, --yes", "Skip interactive prompts, use defaults only")
  .action(async (opts) => {
    const home = getHomeDir();

    printBanner();
    console.log(chalk.bold(`  Setup Wizard\n`));
    console.log(`  Data directory: ${chalk.cyan(home)}\n`);

    // Create directories
    const dataDir = getDataDir();
    await mkdir(dataDir, { recursive: true });
    console.log(chalk.green(`  Created ${dataDir}`));

    // Write config.json if it doesn't exist
    const configPath = getConfigPath();
    if (!existsSync(configPath)) {
      const { agentModes, ...configWithoutKeys } = DEFAULT_CONFIG;
      const configToSave = { agentModes };
      await writeFile(configPath, JSON.stringify(configToSave, null, 2), "utf-8");
      console.log(chalk.green(`  Wrote ${configPath}`));
    } else {
      console.log(chalk.yellow(`  ${configPath} already exists — skipping`));
    }

    // Create .env if it doesn't exist
    const envPath = getEnvPath();
    if (!existsSync(envPath)) {
      await writeFile(envPath, "# Finance Client Environment\n", "utf-8");
      console.log(chalk.green(`  Wrote ${envPath}`));
    } else {
      console.log(chalk.yellow(`  ${envPath} already exists — skipping`));
    }

    console.log();

    // Run login flow unless non-interactive
    if (!opts.yes) {
      const success = await loginFlow();
      if (!success) {
        console.log(chalk.yellow("\n  Skipping API key setup — run `finance login` later.\n"));
      } else {
        // Offer Whop and Polar setup
        await whopSetupFlow();
        await polarSetupFlow();
      }
    }

    console.log(chalk.bold.green("\n  Finance Client initialized!\n"));
    console.log(`  Next steps:`);
    console.log(`    ${chalk.cyan("finance ui")}       — open the dashboard`);
    console.log(`    ${chalk.cyan("finance config")}   — view current config`);
    console.log(`    ${chalk.cyan("finance login")}    — re-authenticate\n`);
  });
