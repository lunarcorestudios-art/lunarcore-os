import "server-only";

import { cache } from "react";
import { connection } from "next/server";

import { createHttpStudioClient } from "@/lib/studio/http";
import { createMockStudioClient } from "@/lib/studio/mock";
import type { StudioClient } from "@/lib/studio/types";

/**
 * One studio client per request. `mock` (default) reads the in-repo seed.
 * `http` calls a BFF that should sit in front of lunarcore-mcp.
 * ClickUp tokens are intentionally unread here.
 */
export const getStudioClient = cache(async (): Promise<StudioClient> => {
  await connection();
  const requested = (process.env.STUDIO_SOURCE ?? "mock").trim().toLowerCase();
  if (requested === "http" || requested === "mcp") return createHttpStudioClient(process.env);
  return createMockStudioClient(process.env);
});
