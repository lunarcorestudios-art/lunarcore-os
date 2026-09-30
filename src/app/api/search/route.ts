import { getStudioClient } from "@/lib/studio/client";
import type { SearchHit } from "@/lib/studio/types";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return Response.json({ items: [], total: 0 });
  }

  const studio = await getStudioClient();
  const page = await studio.search({ query, limit: 12 });
  const items = await Promise.all(page.items.map((hit) => withHref(studio, hit)));
  return Response.json({ items, total: page.total });
}

async function withHref(
  studio: Awaited<ReturnType<typeof getStudioClient>>,
  hit: SearchHit,
): Promise<SearchHit & { href: string }> {
  if (hit.kind === "client") return { ...hit, href: `/clients/${hit.id}` };
  if (hit.kind === "project") return { ...hit, href: `/delivery/${hit.id}` };
  if (hit.kind === "task") {
    try {
      const record = await studio.getTask(hit.id);
      return { ...hit, href: `/delivery/${record.task.projectId}#${record.task.id}` };
    } catch {
      return { ...hit, href: "/delivery" };
    }
  }
  return { ...hit, href: "/" };
}
