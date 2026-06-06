# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

UI **design artifacts** (not a running application) for the **Orchestration Console** — the
front-end for a controlled agent that turns plain-English requests into reviewed, parameterized
Cypher queries over a Neo4j knowledge graph plus registered tools, where every returned value is
traceable to the query, node IDs, and tool call that produced it.

The deliverables are self-contained `.html` files plus a shared CSS design system. The screens have
**no backend** — all data in them is illustrative and baked in. The actual service described by the
design is specced in `docs/orchestration-agent-spec.md`; a first **backend infrastructure scaffold**
(Neo4j + Postgres + a minimal FastAPI core) now lives under `backend/` and `infra/` — see
`docs/backend-infrastructure.md`. The design artifacts do not depend on it.

The one build artifact is `assets/graph-explorer.bundle.js` (the graph engine for the Sigma
explorer), produced by a small esbuild project in `tools/graph-explorer/`. **The bundle is
committed**, so every screen opens with no build; only regenerating it needs `npm install && npm run build`.

## The product constraint that drives every design decision

This is **NOT an AI chatbot.** It is a controlled, deterministic, auditable operations tool. It
chooses among known registered capabilities, never improvises a query, and **clarifies rather than
guesses**. When designing or editing any screen, honor these (from `docs/ui-design-brief.md` §1):

1. **Transparency over magic** — always surface matched intent + confidence, extracted parameters, and the query/tools that ran.
2. **Lineage is first-class** — every result value exposes provenance (template, node IDs, source system, version, timestamp) via drill-down.
3. **Reproducibility** — show `request_id`, versions, and a Replay affordance.
4. **Read vs write is unmistakable** — read results look calm; write/side-effecting actions are visually distinct and require explicit confirmation.
5. **Clarify, don't guess** — ambiguous/unmatched requests get a disambiguation UI, never an auto-generated query.

Do not introduce free-form chat chrome or "AI suggestion" affordances.

## Viewing / running

Open `index.html` in a browser, or serve the folder, or run the container:

```bash
python3 -m http.server 8000     # http://localhost:8000/
docker compose up --build       # http://localhost:8080/
```

Fonts (Space Grotesk, Roboto, Roboto Mono) load from Google Fonts; icons from the Phosphor CDN —
external, so a running container needs network to render them. The graph engine is bundled locally.

## Architecture

**Design system — `assets/console-system.css`.** Self-contained source of truth for all components
(it defines its own tokens — no other CSS file is required). Every class is namespaced `oc-*` and
lives under a root `.oc` element that defines the status/accent aliases.

- **Aesthetic:** white / light-grey surfaces, near-black ink, light hairlines, soft shadows, a dark
  left rail, a single bright-blue accent. Type: Space Grotesk (display), Roboto (UI), Roboto Mono
  (IDs/Cypher/params). Rounded radii (8–12px), pill buttons.
- **Status color encoding is a hard rule:** read = green (calm, default), write = amber
  (side-effect, needs confirmation), error = red, accent = blue (interactive / confidence / links).
  Use the `.oc-pill.read/.write/.err` and `.oc-ro`/`.oc-wo` badges — don't invent colors.
- **Structural pattern = master–detail** (`.oc-split`): work/list on the left, **evidence pane on
  the right carrying real visual weight**. Generalizes across screens (Results→lineage drawer,
  Trace→step inspector, Catalogue→template detail). Collapses to one column ≤1080px; rail hidden ≤720px.
- Key components: `.oc-app`/`.oc-rail`/`.oc-top` shell, `.oc-reqbox` (structured request box, *not*
  a chat input), intent + `.oc-conf` confidence meter, editable `.oc-chip` param chips, `.oc-code`
  monospace block (Cypher/IDs/params read as "evidence"), the vertical `.oc-steps` step tracker with
  inline-expanded inspector, and the `.oc-seg` segmented toggle.

**Screens** (all on the shared system + master-detail pattern; `index.html` links them all):
- `Console - Ask.html` — ⭐ the reference screen: request box → matched intent + confidence →
  editable params → step tracker. Includes the **write-approval gate + modal** (Write-action
  scenario) and the low-confidence clarification path (scenario toggle in the top bar).
- `Results - Lineage.html`, `Trace - Audit.html`, `Clarification.html`, `Intent catalogue.html`,
  `Tool registry.html`, `Graph schema.html`, `History.html` (run log + replay) — the supporting screens.
- `Graph explorer.html` — live instance graph, self-contained SVG force layout (no dependencies).
- `Graph explorer - Sigma.html` — same UX rendered via Sigma.js (WebGL) + ForceAtlas2, loading
  `assets/graph-explorer.bundle.js` (built from `tools/graph-explorer/`).

**Docs (read these before designing a screen).**
- `docs/orchestration-agent-spec.md` — full technical spec: domain graph schema (Site/Asset/
  Component/FailureMode/MaintenanceTask/WorkOrder/Sensor…), lineage record shape, determinism model.
- `docs/ui-design-brief.md` — the master brief, **shared example data** (use it verbatim — see
  below), and per-screen hi-fi prompts listing required must-show elements and states.

**Shared example data.** Every screen uses the *same* scenario for consistency — request "Which
pumps at the North plant are overdue for lubrication?", intent `assets_overdue_for_task` (conf 0.92),
params `site_id=SITE-NORTH` / `task_code=LUBE-01`, `request_id req_7f3a9c21`, three result pumps
(P-101/P-104/P-110), enrichment via `snowflake_runtime_hours@2.1`. Full data in brief §2. **No Lorem
ipsum** — reuse this data.

## Conventions

- Each screen is a **single self-contained HTML artifact** that links `assets/console-system.css`.
- Always render the **states** the brief calls for (empty / matched / executing / complete /
  clarification / error) — that's where this product's UX lives.
- Monospace (`--font-mono`, Roboto Mono) for IDs, Cypher, and parameters; Roboto for UI.
- `screenshots/` is gitignored (design-iteration verification artifacts, not deliverables); so is
  `node_modules/` under `tools/`.
