import { Command } from "commander";
import { loginFlow, whopSetupFlow, polarSetupFlow } from "../auth.js";

export const loginCommand = new Command("login")
  .description("Authenticate with Anthropic and configure service keys")
  .action(async () => {
    const success = await loginFlow();
    if (success) {
      await whopSetupFlow();
      await polarSetupFlow();
    }
  });
