# Graph Query Agent — UI Design Brief & Per-Screen Prompts

Hand this to a design-capable Claude **together with `orchestration-agent-spec.md`**.

**How to use this file:**
1. Paste **Section 1 (Master brief)** and **Section 2 (Shared example data)** once at the start of the session.
2. Then paste **one prompt from Section 3** per screen, iterating on each before moving on.
3. Section 4 has tips for running the session.

---

## 1. Master brief

> **Project:** UI design for an "Graph Query Agent" — an internal enterprise web tool. The full technical spec is attached (`orchestration-agent-spec.md`); read it first.
>
> **What the product does:** A user types a request in natural language → the system matches it to a *registered intent* → runs parameterized Cypher against a Neo4j maintenance/engineering knowledge graph and/or calls *registered tools* (Snowflake/SAP/CMMS) → returns results where **every value is traceable to its source**.
>
> **Critical framing (this drives the whole design):** This is **NOT** an autonomous AI chatbot. It is a *controlled, deterministic, auditable* operations tool. Every action is a known, registered capability; ambiguous requests are clarified, never guessed; every output can be traced back to the exact query, graph node IDs, and tool calls that produced it. The UI must feel **trustworthy, transparent, and in control** — the opposite of "magic AI." Do not design a free-form chat assistant.
>
> **Users:** Reliability/maintenance engineers, operations staff, and domain experts. Desktop-first, data-dense, used for real operational decisions. Target WCAG 2.1 AA; keyboard-friendly.
>
> **Design principles to honour:**
> 1. **Transparency over magic** — always surface the matched intent (+ confidence), the parameters extracted, and the query/tools that ran.
> 2. **Lineage is first-class** — every result value exposes its provenance (template, node IDs, source system, version, timestamp) via drill-down.
> 3. **Reproducibility** — show `request_id`, versions, and a "replay" affordance.
> 4. **Read vs write is unmistakable** — read results look calm; side-effecting/write actions are visually distinct and require explicit confirmation/approval.
> 5. **Clarify, don't guess** — unmatched/ambiguous requests get a disambiguation UI offering candidate intents.
>
> **Visual direction:** Calm, trustworthy, data-dense enterprise aesthetic. Neutral base palette with a single accent; reserve distinct status colours for read / write / error. Use a **monospace** treatment for IDs, Cypher snippets, and parameters so technical detail reads as "evidence." Build tokens as CSS variables. [Replace with your brand/tokens if you have them.]
>
> **Output format:** Produce a **single self-contained HTML + CSS artifact per screen** (inline styles or a `<style>` block, CSS variables for tokens, no external dependencies except a web font). Use realistic data from the shared example below — no "Lorem ipsum." For each screen, end with a 2–3 line rationale naming which spec requirements the design satisfies.

---

## 2. Shared example data (paste once, reuse on every screen)

> Use this exact scenario and data across all screens so the mockups stay consistent.
>
> **User request:** "Which pumps at the North plant are overdue for lubrication?"
>
> **Routing result:**
> - Matched intent: `assets_overdue_for_task` — confidence **0.92**
> - Extracted parameters: `site_id = "SITE-NORTH"` (resolved from "North plant"), `task_code = "LUBE-01"` (resolved from "lubrication")
> - `request_id: req_7f3a9c21`
> - `graph_version: 2026-06-04T09:00Z`
>
> **Plan (ordered, deterministic steps):**
> 1. Classify intent → `assets_overdue_for_task`
> 2. Extract + validate parameters
> 3. Run Cypher template `assets_overdue_for_task@3` (read-only)
> 4. Enrich via tool `snowflake_runtime_hours@2.1` (read-only)
> 5. Assemble response + attach lineage
>
> **Cypher executed** (template `assets_overdue_for_task@3`, params bound):
> ```cypher
> MATCH (s:Site {id: $site_id})-[:CONTAINS]->(a:Asset)
> MATCH (a)<-[:TARGETS]-(wo:WorkOrder)-[:EXECUTES]->(t:MaintenanceTask {code: $task_code})
> WHERE wo.due_date < date() AND wo.status <> 'CLOSED'
> RETURN a.id AS asset_id, a.name AS asset, wo.due_date AS due, wo.status AS status
> ORDER BY wo.due_date ASC
> ```
>
> **Result rows:**
> | asset_id | asset | type | due | overdue | status | runtime_hrs |
> |---|---|---|---|---|---|---|
> | P-101 | Pump P-101 | Centrifugal Pump | 2026-05-20 | 15 days | OPEN | 7,420 |
> | P-104 | Pump P-104 | Centrifugal Pump | 2026-05-28 | 7 days | IN_PROGRESS | 6,980 |
> | P-110 | Pump P-110 | Booster Pump | 2026-06-01 | 3 days | OPEN | 3,110 |
>
> **Tool call record (step 4):**
> - Tool: `snowflake_runtime_hours@2.1` · source: Snowflake · read-only
> - Input: `{ "asset_ids": ["P-101","P-104","P-110"] }`
> - Output: `{ "P-101": 7420, "P-104": 6980, "P-110": 3110 }`
> - Duration: 612 ms · 1 attempt
>
> **Lineage record for the "Pump P-101" cell:**
> ```json
> {
>   "field": "asset",
>   "value": "Pump P-101",
>   "source": "neo4j",
>   "produced_by": { "template": "assets_overdue_for_task@3", "node_ids": ["a:1042"] },
>   "graph_version": "2026-06-04T09:00Z",
>   "request_id": "req_7f3a9c21",
>   "timestamp": "2026-06-04T09:14:21Z"
> }
> ```
>
> **Candidate intents (for the clarification scenario)** — when a request like "show me the north plant pumps" is ambiguous:
> - `assets_overdue_for_task` — assets with an overdue preventive task
> - `assets_by_site` — all assets at a site
> - `asset_health_summary` — condition/health rollup for a site's assets

---

## 3. Per-screen hi-fi prompts

### 3.1 — Console / Ask (hero screen)

> Design the **Console / Ask** screen in high fidelity (single self-contained HTML+CSS artifact), using the shared example data.
>
> **Goal:** the primary workspace where a user submits a request and watches a *transparent, deterministic* execution unfold — never a black box.
>
> **Layout & must-show elements:**
> - A prominent request input (single line or small textarea) with a Run action. Make it clearly a *structured request box*, not a chat thread.
> - A **"matched intent" panel** that appears on submit: intent name `assets_overdue_for_task`, a **confidence indicator (0.92)**, and the **extracted parameters** as editable typed chips (`site_id = SITE-NORTH`, `task_code = LUBE-01`) — so the user can confirm/correct before it runs.
> - A **step tracker** showing the ordered plan (the 5 steps) progressing, with per-step status (done / running / pending) and timing. This is central — it makes determinism and control visible.
> - A persistent header showing `request_id: req_7f3a9c21` and `graph_version`.
> - A clear, calm primary action; a secondary "View full trace" link.
>
> **Render these states** (stack them or use tabs in the artifact): (a) empty/initial, (b) intent matched, awaiting confirmation, (c) executing (step tracker mid-run), (d) complete (links to results).
>
> **Interactions to convey visually:** editable parameter chips; a low-confidence variant that nudges toward clarification rather than auto-running.
>
> End with a 2–3 line rationale mapping elements to spec sections (intent routing §5.2, NL→Cypher §7, determinism/trace §10).

---

### 3.2 — Results + lineage (hero screen)

> Design the **Results + Lineage** screen in high fidelity (single self-contained HTML+CSS artifact), using the shared example data.
>
> **Goal:** present results that are *evidence*, not just data — every value can be traced to its source in one click.
>
> **Layout & must-show elements:**
> - A results **table** of the three pumps (columns: asset, type, due, overdue, status, runtime hrs). Use status pills (OPEN / IN_PROGRESS) and an "overdue" emphasis.
> - A subtle **per-value provenance affordance** (e.g. an info dot on hover/focus, or a "source" column) — clicking opens a **lineage drawer/panel**.
> - The **lineage drawer** for the "Pump P-101" cell: render the provenance record (source = neo4j, template `assets_overdue_for_task@3`, node IDs `[a:1042]`, graph_version, request_id, timestamp) in a clear, scannable way — monospace for IDs. Distinguish **graph-sourced** values (Neo4j) from **tool-sourced** values (the `runtime_hrs` column came from `snowflake_runtime_hours@2.1` — show that source clearly).
> - A results header summarising the request in plain language + the matched intent, with `request_id` and a **Replay** button.
> - An export affordance (CSV) and a "View full trace" link.
>
> **Render these states:** (a) results with lineage drawer closed, (b) lineage drawer open for a Neo4j-sourced value, (c) lineage drawer open for a Snowflake-sourced value, (d) a no-results variant.
>
> **Critical:** make the read-only nature calm and obvious; do not introduce any "AI suggestion" chrome. The differentiator is traceability — make lineage feel premium and effortless.
>
> End with a 2–3 line rationale (lineage §10, read-only results §3, reproducibility/replay §10).

---

### 3.3 — Trace / Audit (hero screen)

> Design the **Trace / Audit** screen in high fidelity (single self-contained HTML+CSS artifact), using the shared example data, for `request_id: req_7f3a9c21`.
>
> **Goal:** a complete, auditable record of one request — enough to *reproduce* it and to satisfy a reviewer/auditor.
>
> **Layout & must-show elements:**
> - A header: the original request text, matched intent + confidence, `request_id`, `graph_version`, total duration, and a **Replay** button (with a note that replay is deterministic).
> - A **timeline / step list** of the 5 plan steps, each expandable:
>   - Step 3 (Cypher): show the **bound query** (the Cypher block from the shared data) with parameters, rows returned, and the **node IDs touched** (`a:1042`, etc.). Monospace, read-only badge.
>   - Step 4 (Tool): show the **tool record** for `snowflake_runtime_hours@2.1` — version, source = Snowflake, input JSON, output JSON, duration 612 ms, 1 attempt, read-only badge.
> - Clear visual encoding for **read vs write** steps (all read here — but show how a write step *would* look distinct, e.g. an amber "side-effect" treatment + approval marker).
> - Each step stamped with a timestamp; everything keyed to the one `request_id`.
>
> **Render these states:** (a) trace fully expanded, (b) a collapsed/summary view, (c) an illustrative **error step** variant (e.g. a tool timeout with retry badges) so the audit view handles failure.
>
> End with a 2–3 line rationale (traceability & lineage §10, determinism/replay §10, read-vs-write §3 / §9).

---

### 3.4 — Clarification / disambiguation

> Design the **Clarification** screen in high fidelity (single self-contained HTML+CSS artifact). This screen embodies the product's "clarify, don't guess" rule — when a request is ambiguous or unmatched, the system **never improvises a query**; it asks.
>
> **Scenario:** the user typed the ambiguous request **"show me the north plant pumps"**. The router resolved the site (`SITE-NORTH`) but can't confidently pick one intent.
>
> **Layout & must-show elements:**
> - Echo the original request, with a calm, plain-English message that confirmation is needed (not an error, not a failure — a deliberate control step).
> - **Candidate intents** as selectable cards (use the three from the shared data): `assets_overdue_for_task`, `assets_by_site`, `asset_health_summary`. Each card shows a plain-English description, what it would return, and a **read/write badge**.
> - On selecting an intent, a **parameter-completion form**: pre-fill the already-resolved `site_id = SITE-NORTH`; prompt for the missing `task_code` with a typed, validated input (and a hint of allowed values). Nothing runs until parameters are valid.
> - Make it unmistakable that **no free-form query is being generated** — the user is choosing among registered capabilities.
>
> **Render these states:** (a) multiple candidate intents offered, (b) one intent chosen with a missing-parameter prompt, (c) **no matching capability** — a polite refusal that points to the Intent catalogue rather than guessing.
>
> End with a 2–3 line rationale (intent routing §5.2, known-intent gate / clarify-don't-guess §7, "not autonomous" out-of-scope §2/§3).

---

### 3.5 — Intent catalogue

> Design the **Intent catalogue** screen in high fidelity (single self-contained HTML+CSS artifact). This is the curated, versioned list of registered capabilities — the heart of "controlled, not autonomous."
>
> **Layout & must-show elements:**
> - A **searchable, filterable list** of registered intents. Use realistic entries: `assets_overdue_for_task` (read), `assets_by_site` (read), `asset_health_summary` (read), and one write intent `create_work_order` (write). Filters by read/write and by capability tag.
> - Each row/card: intent name, plain-English description, parameter summary, **read/write badge**, version (e.g. `@3`).
> - A **detail view** for `assets_overdue_for_task`: full description; the **parameter schema** (`site_id` string required, `task_code` string required) as a clean table; the **parameterized Cypher template** (use the block from the shared data) with a prominent **read-only** badge; the optional enrichment step (`snowflake_runtime_hours`); and a small **version history**.
> - Make clear these are reviewed, version-controlled artefacts — the determinism story.
>
> **Render these states:** (a) catalogue list/grid, (b) detail of the read intent (with template shown), (c) detail of the **write** intent `create_work_order` — visually distinct (amber/side-effect treatment) with an "approval required" marker.
>
> End with a 2–3 line rationale (registered capabilities §3/§5, query templates §7, versioning/determinism §10).

---

### 3.6 — Tool registry

> Design the **Tool registry** screen in high fidelity (single self-contained HTML+CSS artifact). This shows the registered tools (plugins) and their manifests — the controlled, schema-validated integration surface.
>
> **Layout & must-show elements:**
> - A **list of registered tools** with realistic entries:
>   - `snowflake_runtime_hours@2.1` — source Snowflake — **read** — healthy
>   - `sap_asset_master@1.0` — source SAP — **read** — healthy
>   - `cmms_create_work_order@1.2.0` — source CMMS — **write / side-effect, non-idempotent** — healthy
>   - one **degraded** tool to exercise the failure state (circuit-breaker open)
>   Each row shows: name, version, source system, capability tags, **side-effect & idempotency flags**, and a **health/status** indicator + last-used.
> - A **manifest detail view** for `cmms_create_work_order`: input & output **JSON Schema**, `auth` via `secret_ref` (never a raw secret), `timeout_ms`, `retry` policy, `side_effect: true`, `idempotent: false` (idempotency-key required), capability tags. Monospace for schemas.
> - A small **observability panel**: latency, error rate, retries, circuit-breaker state.
>
> **Render these states:** (a) registry list, (b) read-tool detail (`snowflake_runtime_hours`), (c) write/side-effect tool detail (`cmms_create_work_order`) with distinct treatment + idempotency/approval markers, (d) a degraded tool with circuit-breaker open.
>
> End with a 2–3 line rationale (tool registry / plugin architecture §8, API integration patterns §9, observability §14, read-vs-write §3).

---

### 3.7 — Graph schema browser  *(optional surface; built)*

> Design the **Graph schema browser** in high fidelity. A calm, **read-only** reference screen showing the governed, version-controlled shape of the knowledge graph that intents are written against. Master–detail: schema (node labels + relationships) on the left as the "work" surface; a detail/evidence pane on the right for the selected label.
>
> **Must-show elements:**
> - A node-label list/map with the spec's labels: Site, Location, Asset, AssetClass, Component, FailureMode, MaintenanceTask, MaintenancePlan, WorkOrder, Technician, Sensor, Reading. A simple **boxes-and-arrows** relationship overview rendering the spec edges (`Site-[:CONTAINS]->Asset`, `Asset-[:HAS_COMPONENT]->Component`, `Component-[:SUBJECT_TO]->FailureMode`, `FailureMode-[:MITIGATED_BY]->MaintenanceTask`, `WorkOrder-[:TARGETS]->Asset`, `WorkOrder-[:EXECUTES]->MaintenanceTask`, `Sensor-[:MONITORS]->Component`, `Sensor-[:EMITS]->Reading`, etc.) — structure, not a live force graph.
> - A detail pane for the selected label (default **Asset**): description, key properties with types, and incoming/outgoing relationships — relationship/edge & key properties shown in monospace (e.g. `WorkOrder.due_date`, `Reading.ts`, `Reading.value`).
> - **Governance metadata:** `graph_version: 2026-06-04T09:00Z`, the uniqueness constraint `(label, business_id)`, and a "version-controlled / signed off" indicator.
> - A cross-link tying schema to usage: on Asset / WorkOrder / MaintenanceTask, "used by intent `assets_overdue_for_task@3`" linking to the Intent catalogue.
>
> **Render these states:** (a) overview (all labels + relationship map), (b) a node label selected with its properties/relationships, (c) a relationship selected showing endpoints + edge properties. No write affordances — read-only.
>
> End with a 2–3 line rationale (domain graph schema §11, schema-as-reviewed-artefact / collaborative modelling §12, template-bound Cypher & determinism §7/§10).

---

### 3.8 — Write-action approval gate  *(product-critical; built as an in-flow modal)*

> Design the **write-action approval gate** — the surface that makes principle #4 ("read vs write is unmistakable") real. It is **not a standalone screen**: it lives as a state + modal inside the relevant flows (Ask, and referenced from Trace), triggered whenever a side-effecting intent is matched. Reuse the locked design system; the whole surface is **amber** to read as distinct from calm read flows.
>
> **Must-show elements:**
> - In **Ask**: a write scenario where the matched intent is `create_work_order` (amber **write · side-effect** pill, confidence shown), with editable params (`asset_id`, `task_code`, `priority`). The primary action is **"Review & approve write…"**, never an auto-run.
> - In the **evidence/plan pane**: a write plan whose step 3 is an **Approval gate** (amber) reading "awaiting human approval — execution is blocked", with the side-effecting tool step (`cmms_create_work_order@1.2.0`) shown **blocked/pending** beneath it. Execution is visibly gated.
> - The **approval modal** itself: capability + version, a "this changes external state" warning, the parameter set, the backing tool with `side_effect: true` / `idempotent: false`, the **idempotency-key** (with a "guards against duplicate writes on retry" note), **scope & audit** (elevated scope, attributed user, always logged, `request_id`), and an explicit **confirmation checkbox** that gates the **Approve & execute** button. Cancel + backdrop/Esc dismiss.
> - On approval: the gate step resolves to "approved by <user>", the write step executes, and a **success summary** appears (`work_order_id`, approver, "logged") with a link to the full trace.
>
> **Render these states:** (a) write intent matched, gate awaiting; (b) approval modal open (confirm unchecked → Approve disabled; checked → enabled); (c) approved & executed, success summary. (The failed/halted write variant lives in Trace §3.3.)
>
> End with a 2–3 line rationale (read-vs-write & approval-gated side-effects §3/§4, idempotency-key & elevated scope §9/§13, audit/lineage on writes §10/§14).

---

## 4. Running the session — tips

- **Attach the spec.** Upload/paste `orchestration-agent-spec.md` so the designer can reference the domain schema and lineage model directly.
- **Order:** paste Section 1 + Section 2 → ask for **lo-fi wireframes of all 7 screens** first (Console, Results+lineage, Clarification, Trace/audit, Intent catalogue, Tool registry, plus optional Graph schema browser / Write-approval). Review the set, then do the three hero prompts (3.1–3.3) one at a time.
- **Always ask for states.** The loading/clarification/error states are where this product's UX lives.
- **Iterate the hero first.** Get 2–3 layout variations of the Console, pick a direction, then tell the designer to apply that visual system across the other screens for consistency.
- **Keep it honest.** The "rationale per screen" requirement keeps the design anchored to determinism + lineage rather than drifting into generic dashboard chrome.
- **All prompts are written out and all screens are built:** the three hero screens (§3.1–3.3), Clarification (§3.4), Intent catalogue (§3.5), Tool registry (§3.6), the optional Graph schema browser (§3.7), and the product-critical Write-action approval gate (§3.8). The write gate ships as an in-flow modal inside Console / Ask (per the "state/modal, not a standalone screen" decision), not as a separate artifact.
