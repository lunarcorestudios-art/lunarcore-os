import "server-only";

import { cache } from "react";
import { connection } from "next/server";

import { createHttpStudioClient } from "@/lib/studio/http";
import { createMockStudioClient } from "@/lib/studio/mock";
import type { StudioClient } from "@/lib/studio/types";

/**
 * One studio client per request. `mock` (default) reads the in-repo seed.
 * `http` calls a BFF that should sit in front of lunarcore-mcp.
 * ClickUp and Frame.io tokens are intentionally unread here.
 * Shoots and reviews use the same port. See the README for the BFF shape.
 */
export const getStudioClient = cache(async (): Promise<StudioClient> => {
  await connection();
  const requested = (process.env.STUDIO_SOURCE ?? "mock").trim().toLowerCase();
  if (requested === "http" || requested === "mcp") return createHttpStudioClient(process.env);
  return createMockStudioClient(process.env);
});
