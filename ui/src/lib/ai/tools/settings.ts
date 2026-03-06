import { tool } from "ai";
import { z } from "zod";
import { getSettings } from "@/lib/stores/settings";

export const settingsTools = {
  get_settings: tool({
    description: "View current Finance Client settings and configuration",
    inputSchema: z.object({}),
    execute: async () => {
      const settings = getSettings();
      return {
        message: "Current settings",
        settings,
      };
    },
  }),
};
