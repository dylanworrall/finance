import { tool } from "ai";
import { z } from "zod";
import { getSpaces, getSpaceById, addSpace } from "@/lib/stores/spaces";

export const spaceTools = {
  list_spaces: tool({
    description: "List all available financial spaces/workspaces",
    inputSchema: z.object({}),
    execute: async () => {
      const spaces = getSpaces();
      return { count: spaces.length, spaces };
    },
  }),

  get_space: tool({
    description: "Get details of a specific space by ID",
    inputSchema: z.object({
      spaceId: z.string().describe("Space ID"),
    }),
    execute: async ({ spaceId }) => {
      const space = getSpaceById(spaceId);
      if (!space) return { error: `Space "${spaceId}" not found` };
      return { space };
    },
  }),

  create_space: tool({
    description: "Create a new financial space/workspace",
    inputSchema: z.object({
      name: z.string().describe("Space name"),
      description: z.string().describe("Space description"),
      icon: z.string().default("Folder").describe("Icon name"),
    }),
    execute: async ({ name, description, icon }) => {
      const space = addSpace({ name, description, icon });
      return { success: true, space };
    },
  }),
};
