# Lunarcore OS

Internal studio console for [Lunarcore Studios](https://github.com/lunarcorestudios-art). It shows workspace health, clients, and delivery, plus empty shells for the rest of the studio. Live screens read a `StudioClient`. They do not talk to ClickUp. Stub screens do not talk to GoHighLevel, QuickBooks, Frame.io, or an HRIS.

Production data belongs in [lunarcore-mcp](https://github.com/lunarcorestudios-art/lunarcore-mcp), or in a thin BFF in front of it. This web app ships a memory seed so `npm run dev` works with no tokens.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The console is dark by default. The header toggles a light theme.

```bash
npm run lint
npm run build
```

Node.js 20 or newer.

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Workspace health, blocked and at-risk delivery, recent clients, pipeline |
| `/clients` | Client directory, with status filters |
| `/clients/[id]` | One client and the projects under it |
| `/delivery` | Projects grouped by `delivery_status` health |
| `/delivery/[id]` | Milestones, task rollup, and comments for one project |
| `/shoots` | Shoot schedule shell, under Production. ClickUp and a studio calendar later |
| `/reviews` | Frame.io review links, under Production |
| `/pipeline` | GoHighLevel pipeline shell. The home dashboard still shows the seed pipeline |
| `/people` | People shell: roster, capacity, and time off. HRIS later. `/hris` redirects here |
| `/finance` | Finance overview. Tabs for quotes, invoices, and payments |
| `/finance/quotes` | Quotes shell. QuickBooks will own quotes |
| `/finance/invoices` | Invoices shell. QuickBooks will own invoicing |
| `/finance/payments` | Payments shell. QuickBooks will own what has been collected |
| `/settings` | Studio profile placeholder, integration stubs, and portal-app notes |
| `/staff` | Staff portal shell. Off the main rail. Role gating comes later |
| `/portal` | Client portal shell. Off the main rail. Role gating comes later |

The module → adapter map lives in `src/components/shell/nav.ts`. Stub routes render empty states only. This app does not take OAuth or SDK dependencies for those adapters.

The shell is the sidebar, a search field, and the signed-in actor from `whoami`. Search is a stub over the same `StudioClient.search` port. It is not a separate index.

## Architecture

```
src/app/                  App Router screens. Server Components load the studio.
src/components/           Shell, studio UI, and small primitives (button, dialog, input).
src/lib/studio/types.ts   Entity shapes mirrored from lunarcore-mcp.
src/lib/studio/client.ts  getStudioClient() — mock by default, HTTP when configured.
src/lib/studio/mock.ts    In-memory seed. source: "stub".
src/lib/studio/http.ts    BFF bridge. No ClickUp credentials.
src/lib/studio/delivery.ts  Health rollup, same rule as lunarcore-mcp.
```

`StudioClient` is a read port. Writes stay on lunarcore-mcp (`client_create`, `task_update`, and the rest). Tool payloads here match the MCP `data` objects: `Page<T>` is `{ items, total }`, and `deliveryStatus` returns the MCP `DeliveryStatus` object.

Health rule, copied from the MCP memory adapter:

1. A project with status `delivered` is `delivered`.
2. Otherwise a blocked task or milestone is `blocked`.
3. Otherwise an open milestone past its due date is `at_risk`.
4. Otherwise `on_track`.

ClickUp mapping, owned by lunarcore-mcp:

| Studio | ClickUp |
| --- | --- |
| Client | Folder in the **Client Work** space. Names starting with `_TEMPLATE` are not clients. |
| Project | List in that folder. Names starting with `_archive` are hidden unless asked for. |
| Task | Task on that list, excluding milestones. |
| Delivery status | Rollup of the list's milestones and tasks. |

The full map, including what ClickUp cannot store, is in the [lunarcore-mcp README](https://github.com/lunarcorestudios-art/lunarcore-mcp#clickup-mapping).

Pipeline may be empty. The ClickUp adapter in lunarcore-mcp returns `not_implemented` for leads and proposals. The memory seed includes one qualified lead so the dashboard panel has a shape. When the bridge returns `not_implemented`, the panel shows that reason instead of invented numbers.

## Data sources

`STUDIO_SOURCE` chooses the adapter.

| Value | Behavior |
| --- | --- |
| `mock` (default) | Seed in `src/lib/studio/seed.ts`. No network. |
| `http` | `GET` the BFF described below. |

Copy `.env.example` to `.env.local` to override the actor name on the mock source. The HTTP bridge uses `whoami` from the BFF and ignores those actor variables.

Do not set `CLICKUP_API_TOKEN` on this app. lunarcore-mcp is the process that holds ClickUp and Google credentials. This console only needs a studio base URL when a BFF exists.

The seed uses Client Work folder names (Banwa Wellness Spa, Kobelco, Mori & Mill, and the others) so the floor looks like the studio. Project copy, members, and contacts are authored for the demo. Contact emails are `@example` or `@lunarcore.studio`. Nothing in the seed is a live export or a secret.

## HTTP bridge

lunarcore-mcp speaks MCP over stdin/stdout. It has no HTTP API. A BFF should call the `StudioOs` port (or the MCP tools) and expose the routes below. Successful bodies use the MCP envelope:

```json
{ "ok": true, "source": "clickup", "data": {} }
```

Failures use `{ "ok": false, "source": "clickup", "error": { "code": "not_found", "message": "..." } }` with a non-2xx status. `not_found` becomes a 404 page. `not_implemented` on `GET /v1/pipeline` renders the empty pipeline state. Other codes surface on the error screen.

| Method | Path | `data` |
| --- | --- | --- |
| `GET` | `/v1/whoami` | `{ actor }` |
| `GET` | `/v1/workspace` | `WorkspaceContext` |
| `GET` | `/v1/clients?status&query&limit` | `{ items, total }` |
| `GET` | `/v1/clients/:id` | `{ client }` |
| `GET` | `/v1/projects?clientId&status&query&limit` | `{ items, total }` |
| `GET` | `/v1/projects/:id` | `{ project }` |
| `GET` | `/v1/projects/:id/delivery` | `DeliveryStatus` |
| `GET` | `/v1/milestones?projectId` | `{ items, total }` |
| `GET` | `/v1/tasks?projectId&status&query&limit` | `{ items, total }` |
| `GET` | `/v1/tasks/:id` | `{ task, comments }` |
| `GET` | `/v1/members` | `{ items, total }` |
| `GET` | `/v1/pipeline` | `PipelineSummary` |
| `GET` | `/v1/search?query&limit` | `{ items, total }` of search hits |

Set `STUDIO_HTTP_BASE_URL` to the origin (`http://localhost:8787`). `STUDIO_HTTP_TOKEN`, when set, is sent as `Authorization: Bearer`. That token is for the BFF, not for ClickUp.

```bash
STUDIO_SOURCE=http
STUDIO_HTTP_BASE_URL=http://localhost:8787
npm run dev
```
