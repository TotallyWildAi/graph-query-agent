# Graph Query Agent — Orchestration Console (UI design)

UI design work for the **Orchestration Console**: a lightweight, controlled
orchestration agent that turns plain-English requests into reviewed,
parameterized Cypher queries over a Neo4j knowledge graph (plus registered
tools), where **every returned value is traceable** to the query, node IDs and
tool call that produced it.

> Core constraint shaping the whole design: this is **not** an AI chatbot. It is
> a controlled, deterministic, auditable operations tool. It chooses among
> known registered capabilities, never improvises a query, and **clarifies
> rather than guesses**. The UI's job is to make that machinery visible —
> matched intent + confidence, extracted parameters, the steps that ran, and
> lineage on every output.

These are **HTML design artifacts** (open in a browser). No backend, no
database — all data is illustrative and baked into the screens.

---

## Status

| Screen | State |
|---|---|
| Console / Ask (+ in-flow write-approval gate) | ✅ hi-fi |
| Results + lineage | ✅ hi-fi |
| Trace / audit | ✅ hi-fi |
| Clarification / disambiguation | ✅ hi-fi |
| Intent catalogue | ✅ hi-fi |
| Tool registry | ✅ hi-fi |
| Graph schema browser | ✅ hi-fi |
| Graph explorer (instance data) | ✅ hi-fi — SVG (no-dep) + Sigma.js/WebGL |

All screens are built on one shared design system (`assets/console-system.css`)
and share the master-detail pattern. The write-approval gate lives inside the
Ask flow (Write-action scenario), not as a standalone screen.

---

## What's here

```
index.html                      landing page linking every screen
Console - Ask.html              ⭐ the reference screen (request → intent → plan)
Results - Lineage.html          results table + lineage drawer (evidence face 1)
Trace - Audit.html              audit timeline + step inspector (evidence face 2)
Clarification.html              candidate intents + parameter completion
Intent catalogue.html           registered capabilities, read + write detail
Tool registry.html              tool manifests, health + observability
Graph schema.html               graph model: labels, relationships, governance
Graph explorer.html             live instance graph — self-contained SVG force layout
Graph explorer - Sigma.html     same, rendered via Sigma.js (WebGL) + ForceAtlas2

assets/
  console-system.css            ⭐ the design system (tokens + oc-* components)
  graph-explorer.bundle.js      bundled graph engine (graphology + Sigma.js + ForceAtlas2)
  tw-stamp-light.svg            brand mark

tools/graph-explorer/           esbuild source for graph-explorer.bundle.js
docs/
  orchestration-agent-spec.md   technical spec
  ui-design-brief.md            UI brief + per-screen prompts + example data

Dockerfile / docker-compose.yml static-server image (nginx) for a quick preview
```

## Viewing

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000        # then open http://localhost:8000/
```

Or run the container:

```bash
docker compose up --build          # then open http://localhost:8080/
```

In **Console - Ask.html**, click `Confirm & run plan` to watch the step tracker
execute, expand any step for its bound Cypher / node IDs / tool I/O, and use the
`High confidence / Ambiguous / Write action` toggle to see the "clarify, don't
guess" path and the write-approval gate. In the **Graph explorer**, click a node
to expand its neighbours or "Expand full graph" to see the force layout.

> Fonts and icons load from CDNs (Google Fonts, Phosphor), so a running
> container needs network to render them. The graph engine is bundled locally.

---

## Design system

A modern, calm enterprise aesthetic — white surfaces, a dark rail, a single
bright-blue accent.

- **Base:** white / light-grey surfaces, near-black ink, light hairlines, soft
  shadows. The left rail is dark.
- **Accent:** bright blue — interactive elements, links, the confidence meter.
- **Status encoding (hard rule):** green = read (calm) · amber = write
  (side-effect, needs confirmation) · red = error · blue = accent.
- **Type:** Space Grotesk (display/headings), Roboto (UI), Roboto Mono (IDs /
  Cypher / parameters).

**Structural pattern — master-detail.** Work/list on the left, **evidence on the
right** (carrying real visual weight, not a sidebar). It generalizes across every
screen: Results → lineage drawer, Trace → step inspector, Catalogue → template
detail, Registry → manifest detail. Collapses to a single column below 1080px.

**Components (`oc-*`):** status pills (read/write/error), the right-pane evidence
panel, the monospace code/param block, editable parameter chips + confidence
meter, the vertical step-tracker (collapsed + inline-expanded), and the
write-approval modal.

---

## Note on fonts/icons

Fonts (Space Grotesk, Roboto, Roboto Mono) load from Google Fonts; icons from the
Phosphor CDN. No licensed files are vendored. The graph engine (graphology +
Sigma.js + ForceAtlas2) is bundled into `assets/graph-explorer.bundle.js`;
rebuild it with `npm install && npm run build` in `tools/graph-explorer/`.
