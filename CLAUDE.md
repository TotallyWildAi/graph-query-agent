# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

UI **design artifacts** (not a running application) for the **Orchestration Console** — the
front-end for a controlled agent that turns plain-English requests into reviewed, parameterized
Cypher queries over a Neo4j knowledge graph plus registered tools, where every returned value is
traceable to the query, node IDs, and tool call that produced it.

There is **no build step, no package manager, no test suite, no backend code here**. The
deliverables are self-contained `.html` files plus a shared CSS design system. The actual service
described by the design lives elsewhere; `docs/orchestration-agent-spec.md` is its spec.

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

No build. Open any `.html` in a browser, or serve the folder (the explorations file fetches local
`.js` over HTTP, so use a server for that one):

```bash
python3 -m http.server 8000
# http://localhost:8000/Console%20-%20Ask.html
```

Fonts (Inter, JetBrains Mono, Caveat) load from Google Fonts; icons from the Phosphor CDN;
`Console Explorations.html` loads React 18 + Babel standalone from unpkg. All external — needs network.

## Architecture

**Design system (locked) — `assets/console-system.css`.** This is the source of truth for all
components. It **requires `assets/colors_and_type.css` to be loaded first** (it consumes those CSS
variables — `--ink`, `--paper`, `--accent-cyan`, etc.). Every class is namespaced `oc-*` and lives
under a root `.oc` element that defines the status/accent aliases. Clean mode = 6px radii.

- **Status color encoding is a hard rule:** read = green (calm, default), write = amber
  (side-effect, needs confirmation), error = marker-red, accent = cyan (interactive / confidence /
  links). Use the `.oc-pill.read/.write/.err` and `.oc-ro`/`.oc-wo` badges — don't invent colors.
- **Structural pattern = master–detail** (`.oc-split`): work/list on the left, **evidence pane on
  the right carrying real visual weight**. Generalizes across screens (Results→lineage drawer,
  Trace→step inspector, Catalogue→template detail). Collapses to one column ≤1080px; rail hidden ≤720px.
- Key components: `.oc-app`/`.oc-rail`/`.oc-top` shell, `.oc-reqbox` (structured request box, *not*
  a chat input), intent + `.oc-conf` confidence meter, editable `.oc-chip` param chips, `.oc-code`
  monospace block (Cypher/IDs/params read as "evidence"), and the vertical `.oc-steps` step tracker
  with inline-expanded inspector.

**Screens.**
- `Console - Ask.html` — ⭐ the **locked, hi-fi reference screen**. Standalone (links the two CSS
  files + Phosphor; has inline `<script>` for the step-tracker demo). The remaining five screens
  (Results+lineage, Clarification, Trace/audit, Intent catalogue, Tool registry) are pending and
  must inherit this same visual system and master-detail pattern.
- `Console Explorations.html` — a compare canvas (A/B/C layout directions). It renders via React +
  Babel: `design-canvas.jsx` provides a Figma-ish `DesignCanvas` wrapper, and `consoles/variation-{a,b,c}.js`
  each export an HTML string to `window.OC_VAR_A/B/C` that the canvas injects. Edit a variation by
  editing its `.js` string. `variation-a` (vertical flow) is the responsive single-column fallback.
- `wireframes/Orchestration Console - Wireframes.html` — grayscale lo-fi, all 7 screens + screen map.

**Docs (read these before designing a screen).**
- `docs/orchestration-agent-spec.md` — full technical spec: domain graph schema (Site/Asset/
  Component/FailureMode/MaintenanceTask/WorkOrder/Sensor…), lineage record shape, determinism model.
- `docs/ui-design-brief.md` — the master brief, **shared example data** (use it verbatim — see
  below), and per-screen hi-fi prompts (§3.1–3.6) listing required must-show elements and states.

**Shared example data.** Every screen uses the *same* scenario for consistency — request "Which
pumps at the North plant are overdue for lubrication?", intent `assets_overdue_for_task` (conf 0.92),
params `site_id=SITE-NORTH` / `task_code=LUBE-01`, `request_id req_7f3a9c21`, three result pumps
(P-101/P-104/P-110), enrichment via `snowflake_runtime_hours@2.1`. Full data in brief §2. **No Lorem
ipsum** — reuse this data.

## Conventions

- Each hi-fi screen is a **single self-contained HTML+CSS artifact** and ends with a 2–3 line
  rationale mapping its elements to spec sections.
- Always render the **states** the brief calls for (empty / matched / executing / complete /
  clarification / error) — that's where this product's UX lives.
- Monospace (`--font-mono`, JetBrains Mono) for IDs, Cypher, and parameters; Inter for UI.
- `screenshots/` is gitignored (design-iteration verification artifacts, not deliverables).
