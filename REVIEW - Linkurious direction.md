# Design review — "Linkurious" visual direction
**Branch:** `design/linkurious-direction` · **PR #1** · reviewed against `REVIEW-BRIEF.md` + `design-reference/linkurious/STYLE.md`
**Method:** imported the branch and judged from the rendered `NEW-*.png` captures (full desktop width) compared to the Linkurious source reference (`home-*`, `product-*`, `VID-frame-*`).

## Verdict — **ITERATE (adopt the direction; ship after the P1s)**
The direction is genuinely good and faithful to the reference: white/black/`#1499ff`, the dot-ring rail motif, Space Grotesk display, pill controls, dark syntax-tinted code blocks. **All five hard product constraints hold** — structured request box (not a chatbot), matched-intent + confidence + params + step plan visible, lineage first-class (Results drawer / Trace inspector), read=green vs write=amber unmistakable, master-detail + mono everywhere. It's a real upgrade in polish over the locked system. Two structural items and a few polish items stand between this and "adopt."

---

## P1 — fix before adopting

### P1-1 · No-dep Graph explorer "Expand full graph" is an illegible hairball
**File:** `Graph explorer (Linkurious).html` (`NEW-gx-full.png`)
**Problem:** At 137 nodes / 222 edges every node *and* every edge-type label renders at once, so labels stack and collide ("Bearing", "Impeller sensor", "Seal sensor", "EMITS", "MONITORS" overprinting each other). The Linkurious reference (`VID-frame-*.png`) never shows this — it shows a small neighbourhood with a few clean labels and reveals detail on click. This is the single biggest fidelity gap. The **Sigma version handles it far better** (`NEW-sigma-full.png`: fewer labels, real spacing, the black "North Plant" hub legible).
**Fix (gate label rendering; drop edge labels until zoomed/selected):**
```js
// only label hubs, hovered, or selected nodes — not all 137
const LABEL_MIN_DEGREE = 6;
function showLabel(n){ return n === hovered || n === selected || n.degree >= LABEL_MIN_DEGREE; }
// edge-type labels: only when an edge is selected, or zoom > threshold
function showEdgeLabel(e){ return e === selectedEdge || view.zoom > 1.6; }
```
```css
/* fade non-focal labels so the canvas reads like the reference */
.gx-label{ opacity:.0; transition:opacity .15s; pointer-events:none; }
.gx-node.is-hub .gx-label,
.gx-node.is-hover .gx-label,
.gx-node.is-selected .gx-label{ opacity:1; }
```
Also make **"Expand full graph"** land fit-to-view (not centred-overlap) and prefer the seed/neighbourhood as the default view. Given Sigma is cleaner and the rail already points to it, consider **making Sigma primary and the no-dep the explicit fallback.**

### P1-2 · Two parallel design systems (Ask hero vs the rest)
**File:** `Console - Ask (Linkurious).html`
**Problem:** The hero defines its **own token namespace** — `--lk-black`, `--lk-surface-2`, `--lk-ink-soft`, `--lk-paper`, `--lk-line`, `--r-pill`, `--r-card`, `--shadow-pop` — plus bespoke classes (`.seg`, `.modal`, `.backdrop`, `.m-accent`). The other six screens + `assets/linkurious-system.css` use `--ink / --paper / --ink-line / --r-md` and the `.oc-*` API. That's two sources of truth for the most important screen, and it's already causing visible divergence (P2-1). The brief flags this.
**Fix:** Port the hero onto `linkurious-system.css` — same markup, swap `--lk-*`→shared vars and `.seg/.modal`→`.oc-seg/.oc-modal`, then delete the embedded `:root{ --lk-* }` block. Not a rewrite; a find-and-replace pass. Map:
```
--lk-black → #0A0B0D (rail already uses this literal)   --lk-paper → var(--card)
--lk-surface-2 → var(--card-sunk)   --lk-line → var(--ink-line)
--r-pill → 999px   --r-card → var(--r-lg)   --shadow-pop → var(--shadow-lift)
.seg → .oc-seg   .modal → .oc-modal   .backdrop → .oc-modal-backdrop
```

---

## P2 — fix soon (visible polish)

### P2-1 · Near-black borders on the six "swapped" screens
**Files:** `Results - Lineage`, `Trace - Audit`, `Graph schema`, etc. — the per-file `<style>` blocks.
**Problem:** These screens re-declare shared components with `1.5px solid var(--ink)` (**#0A0B0D**) instead of the hairline `--ink-line` (**#E4E5E8**). Against the airy white aesthetic they read heavy. Confirmed instances:
- `.oc-seg` + `.oc-seg button+button` — the RESULTS/NO RESULTS and READ/WRITE/FAILED toggles (`NEW-results.png`, `NEW-trace.png`)
- `.res-table-wrap` + `table.res thead th` bottom border + `.stat.prog` + `.lin-src.graph` + `.srcdot.graph` (`NEW-results.png`)
- the selected schema node-box (`NEW-schema.png`)

**Fix (single shared edit beats per-file patching):** promote these to `assets/linkurious-system.css` so all screens inherit hairlines, then delete the per-file overrides:
```css
/* assets/linkurious-system.css — shared, hairline by default */
.oc-seg{ display:inline-flex; background:var(--card-sunk); border:none;
         border-radius:999px; padding:3px; }                 /* pill, see P2-2 */
.oc-seg button{ border:none; background:none; border-radius:999px;
         padding:6px 14px; font-family:var(--font-mono); font-size:11px;
         text-transform:uppercase; color:var(--ink-soft); cursor:pointer; }
.oc-seg button.on{ background:var(--ink); color:#fff; }
.res-table-wrap{ border:1px solid var(--ink-line); }
table.res thead th{ border-bottom:1px solid var(--ink-line); }
.stat.prog{ border-color:var(--ink-line); color:var(--ink); }
.lin-src.graph, .srcdot.graph{ border-color:var(--ink-line); }
/* Graph schema selected node-box */
.lbl-item.sel, .nbox.sel{ border-color:var(--ink-line);
         box-shadow:0 0 0 3px var(--accent-cyan-soft); }   /* blue ring, not black */
```

### P2-2 · Two different segmented toggles for the same job
**Problem:** Ask uses a clean borderless **pill** (`.seg`: surface-2 track, black active chip — looks great, matches Linkurious). The other six use a hard-edged **square bordered** `.oc-seg`. Same control, two looks.
**Fix:** the shared `.oc-seg` in P2-1 *is* Ask's pill — adopt it everywhere and retire the bordered variant. (Resolves the toggle half of P1-2 and P2-1 together.)

### P2-3 · Graph node palette collides with the reserved status colors
**Files:** `Graph explorer` + `Sigma` legends.
**Problem:** Categorical node colors reuse the four reserved semantic hues with *different* meanings: **Asset = `#1499ff`** (the exact interactive accent), **FailureMode = red** (= "error"), **MaintenanceTask = green** (= "read/ok"), **WorkOrder = amber** (= "write"). On a product whose hard rule is "those four colors mean status," a red node reads as an error and an amber node as a write.
**Fix:** shift the categorical palette off the semantic four (keep Site black, Sensor violet which is already safe):
```js
const NODE_COLORS = {
  Site:'#0A0B0D', Asset:'#4F46E5' /*indigo, not accent-blue*/,
  Component:'#0EA5B5' /*teal*/, FailureMode:'#C026A3' /*magenta, not error-red*/,
  MaintenanceTask:'#0F766E' /*deep teal, not read-green*/,
  WorkOrder:'#9A6B00' /*ochre, distinct from write-amber*/,
  Sensor:'#7B6BE0', Technician:'#475569'
};
```
Minimum viable: at least move **Asset off pure `#1499ff`** and add a "categorical — not status" caption to the legend.

---

## P3 — nice-to-have
- **P3-1 · Sigma layout label is misleading.** Breadcrumb reads `sigma.js · forceatlas2 · webgl`, but the PR admits it's a custom force layout, not true ForceAtlas2. Relabel to `force layout` (or wire real FA2 via a build step).
- **P3-2 · Commit a curated handful of render PNGs (or attach to the PR).** They're gitignored, so review currently depends on a local checkout — the five `NEW-*` heroes in the PR would let any reviewer judge without cloning.
- **P3-3 · Display weight.** Space Grotesk 700 is a good FKGrotesk-800 substitute but reads slightly lighter at large sizes; add `letter-spacing:-.02em` on `h1/h2` to better match the reference's heft.

---

## What's working (keep)
Faithful palette + dot-ring rail motif · not-a-chatbot preserved · transparency (intent + confidence + params + plan all visible) · lineage first-class (Results drawer, Trace step-inspector) · read/write unmistakable (green read pills, amber write modal with the approval gate) · consistent master-detail · mono for IDs/Cypher/params · dark syntax-tinted code blocks look excellent · Sigma seed view + light canvas closely mirror the Linkurious graph workspace.
