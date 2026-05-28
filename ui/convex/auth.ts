import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

// During `convex deploy`, registerRoutes calls createAuth to discover routes.
// Env vars aren't available at that time, so provide fallbacks for analysis.
const getEnv = (key: string, fallback: string): string => {
  try {
    const val = (process as any)["env"][key];
    return val || fallback;
  } catch {
    return fallback;
  }
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: getEnv("SITE_URL", "http://localhost:3000"),
    secret: getEnv("BETTER_AUTH_SECRET", "placeholder-secret-for-route-discovery-only"),
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    plugins: [convex({ authConfig })],
  });
};
