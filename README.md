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

These are **HTML design artifacts** (open in a browser). No build step.

---

## Status

| Screen | State |
|---|---|
| Screen map + lo-fi wireframes (all 7) | ✅ done |
| Console / Ask | ✅ hi-fi locked & verified |
| Results + lineage | ⬜ pending |
| Clarification / disambiguation | ⬜ pending |
| Trace / audit | ⬜ pending |
| Intent catalogue | ⬜ pending |
| Tool registry | ⬜ pending |
| Graph schema browser | ⏸ deferred (optional in spec) |

The **design system is locked** (`assets/console-system.css`). The remaining
five screens inherit the same master-detail pattern.

---

## What's here

```
Console - Ask.html              ⭐ hi-fi, locked — the reference screen
Console Explorations.html       3 layout directions on a compare canvas (A/B/C)
wireframes/
  Orchestration Console - Wireframes.html   grayscale lo-fi, all 7 screens + screen map

assets/
  console-system.css            ⭐ locked design system (tokens + components)
  colors_and_type.css           Totally Wild AI base tokens (upstream)
  tw-stamp-light.svg            brand mark

consoles/                       variation source for Console Explorations.html
  variation-a.js                A · vertical flow
  variation-b.js                B · split workspace
  variation-c.js                C · pipeline console
design-canvas.jsx               compare-canvas scaffold

docs/
  orchestration-agent-spec.md   technical spec
  ui-design-brief.md            UI brief + per-screen prompts + example data
```

## Viewing

Open any `.html` file directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/Console%20-%20Ask.html
```

In **Console - Ask.html**, click `Confirm & run plan` to watch the step tracker
execute, expand any step for its bound Cypher / node IDs / tool I/O, and use the
`High confidence / Ambiguous` toggle to see the "clarify, don't guess" path.

---

## Design system (locked)

Built on the **Totally Wild AI** design system, clean mode (6px radii).

- **Base:** cream paper / deep ink, subtle paper texture.
- **Accent:** cyan — interactive, links, the confidence meter.
- **Status encoding:** green = read (calm) · amber = write (side-effect) ·
  marker-red = error.
- **Type:** Inter (UI), JetBrains Mono (IDs / Cypher / params), Caveat (brand
  mark only).

**Structural pattern — master-detail.** Work/list on the left, **evidence on the
right** (carrying real visual weight, not a sidebar). It generalizes across every
screen: Results → lineage drawer, Trace → step inspector, Catalogue → template
detail, Registry → manifest detail. Collapses to a single column below 1080px.

**Components:** status pills (read/write/error), the right-pane evidence panel,
the monospace code/param block, editable parameter chips + confidence meter, and
the vertical step-tracker (collapsed + inline-expanded states).

---

## Note on fonts/icons

Fonts (Inter, JetBrains Mono, Caveat) load from Google Fonts; icons from the
Phosphor CDN. No licensed files are vendored. See the Totally Wild AI design
system for substitution guidance.
