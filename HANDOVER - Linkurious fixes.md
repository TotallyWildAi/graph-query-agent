# HANDOVER — Linkurious direction: review fixes
**For:** Claude Code engineer · **Branch:** `design/linkurious-direction` (work here; do **not** touch `main`)
**Source of findings:** `REVIEW - Linkurious direction.md` (design review of PR #1)
**Status:** design review complete → verdict **ITERATE**. This doc is the implementation plan.

> ### ⚑ Progress (applied during review, on this branch)
> The designer already applied the lower-risk fixes so they can be reviewed live:
> - ✅ **P1-1** de-hairballed `Graph explorer (Linkurious).html` (label gating + zoom-revealed edge labels).
> - ✅ **P2-1 / P2-2** hairline borders + shared pill toggle across Results, Trace, Graph schema, Tool registry, Intent catalogue, Clarification; shared `.oc-seg` added to `assets/linkurious-system.css`.
> - ✅ **P2-3** recolored the graph node palette off the four reserved status hues in **both** explorers (also fixed a real bug: Technician & MaintenanceTask were both `#19A05F`).
>
> **Still open for you:**
> - ⬜ **P1-2 (Ask hero → shared system)** — deliberately deferred. It's a ~640-line rewrite of the hero's bespoke `.app/.rail/.seg/.split` markup + `--lk-*` tokens onto the `.oc-*` API, i.e. a true refactor, not a targeted edit. Do this carefully against `NEW-ask-matched.png` / `NEW-ask-modal.png` (see task below).
> - ⬜ **P3-1 / P3-2 / P3-3** (optional polish).

---

## Scope & guardrails (read first)
- **Do NOT modify the locked system:** `assets/console-system.css`, `assets/colors_and_type.css`, or any non-`(Linkurious)` screen. Those are the system of record on `main`.
- **All edits stay on `design/linkurious-direction`** and touch only `* (Linkurious).html` files, the two `Graph explorer*` files, and `assets/linkurious-system.css`.
- **Prefer editing the shared `assets/linkurious-system.css`** over per-file `<style>` blocks — fixes should propagate across screens.
- This is **targeted fixes, not a rewrite.** Preserve all content, states, copy, and the product constraints (not-a-chatbot, transparency, lineage-first, read=green/write=amber, master-detail, mono for IDs/Cypher/params).
- These are **prototypes** — verify by opening each file in a browser (`python3 -m http.server`) and clicking through; there is no build/test suite.

---

## Task list (priority order)

### ⬛ P1-1 — De-hairball the no-dep Graph explorer
**File:** `Graph explorer (Linkurious).html`
**Problem:** "Expand full graph" renders all 137 nodes + every edge-type label at once → labels collide, illegible. Reference shows a clean neighbourhood.
**Do:**
1. Gate node labels — only render for hovered / selected / high-degree hub nodes:
   ```js
   const LABEL_MIN_DEGREE = 6;
   function showLabel(n){ return n === hovered || n === selected || n.degree >= LABEL_MIN_DEGREE; }
   ```
2. Gate edge-type labels (EMITS/MONITORS/…) — hide unless an edge is selected or zoomed in:
   ```js
   function showEdgeLabel(e){ return e === selectedEdge || view.zoom > 1.6; }
   ```
3. CSS — fade non-focal labels:
   ```css
   .gx-label{ opacity:0; transition:opacity .15s; pointer-events:none; }
   .gx-node.is-hub .gx-label, .gx-node.is-hover .gx-label, .gx-node.is-selected .gx-label{ opacity:1; }
   ```
4. Make **"Expand full graph"** fit-to-view after layout settles (not centred-overlap); keep the seed/neighbourhood as the default landing view.
**Acceptance:** at full graph, only hubs/selection are labelled, no overprinted text; clicking a node reveals its label + neighbours; "fit" frames the whole graph. Compare to `design-reference/linkurious/NEW-sigma-full.png` (the target density).
> Note: the rail already points to the Sigma version as primary — good. Keep the no-dep as the documented fallback.

### ⬛ P1-2 — Collapse the Ask hero onto the shared system
**File:** `Console - Ask (Linkurious).html`
**Problem:** Hero defines its own `--lk-*` tokens + bespoke classes (`.seg/.modal/.backdrop/.m-accent`); the other six use `assets/linkurious-system.css` (`--ink/--paper/--ink-line`, `.oc-*`). Two sources of truth.
**Do:** find-and-replace onto the shared API, then delete the embedded `:root{ --lk-* }` block and any now-duplicated component CSS. Mapping:
   ```
   --lk-black     → #0A0B0D            --lk-paper   → var(--card)
   --lk-surface-2 → var(--card-sunk)   --lk-line    → var(--ink-line)
   --lk-ink-soft  → var(--ink-soft)    --r-pill     → 999px
   --r-card       → var(--r-lg)        --shadow-pop → var(--shadow-lift)
   .seg → .oc-seg   .modal → .oc-modal   .backdrop → .oc-modal-backdrop
   ```
**Acceptance:** Ask renders visually identical to `NEW-ask-matched.png` / `NEW-ask-modal.png`; no `--lk-` token remains (`grep -c -- '--lk-' "Console - Ask (Linkurious).html"` → 0); all three scenarios (High/Ambiguous/Write) + the approval modal still work.

### ⬛ P2-1 + P2-2 — Hairline borders + one shared segmented toggle
**File:** `assets/linkurious-system.css` (add/centralise), then delete the per-file overrides in `Results - Lineage`, `Trace - Audit`, `Graph schema`.
**Problem:** swapped screens re-declare components with `1.5px solid var(--ink)` (#0A0B0D) instead of `--ink-line` (#E4E5E8); Ask's toggle is a clean pill, the others are hard squares.
**Do:** add to the shared stylesheet (this *is* Ask's pill toggle, promoted):
   ```css
   .oc-seg{ display:inline-flex; background:var(--card-sunk); border:none;
            border-radius:999px; padding:3px; }
   .oc-seg button{ border:none; background:none; border-radius:999px; padding:6px 14px;
            font-family:var(--font-mono); font-size:11px; text-transform:uppercase;
            color:var(--ink-soft); cursor:pointer; transition:all var(--dur-fast) var(--ease); }
   .oc-seg button.on{ background:var(--ink); color:#fff; }
   .res-table-wrap{ border:1px solid var(--ink-line); }
   table.res thead th{ border-bottom:1px solid var(--ink-line); }
   .stat.prog{ border-color:var(--ink-line); color:var(--ink); }
   .lin-src.graph, .srcdot.graph{ border-color:var(--ink-line); }
   .lbl-item.sel, .nbox.sel{ border-color:var(--ink-line); box-shadow:0 0 0 3px var(--accent-cyan-soft); }
   ```
   Then remove the matching `.oc-seg{…var(--ink)…}`, `.res-table-wrap`, `.stat.prog`, `.lin-src.graph`, `.srcdot.graph`, and selected-node-box rules from each per-file `<style>` block.
**Acceptance:** no `1.5px solid var(--ink)` borders remain on the swapped screens (`grep -rn '1.5px solid var(--ink)' *\ \(Linkurious\).html`); toggles look identical across Ask / Results / Trace; schema selection shows a blue ring, not a black box. Compare to `NEW-results.png`, `NEW-trace.png`, `NEW-schema.png`.

### ⬛ P2-3 — Move graph node palette off the reserved status colors
**Files:** `Graph explorer (Linkurious).html` + `Graph explorer - Sigma (Linkurious).html` (node color map + legend).
**Problem:** Asset=`#1499ff` (= interactive accent), FailureMode=red (= error), MaintenanceTask=green (= read), WorkOrder=amber (= write). Collides with the hard status rule.
**Do:**
   ```js
   const NODE_COLORS = {
     Site:'#0A0B0D', Asset:'#4F46E5' /*indigo*/, Component:'#0EA5B5' /*teal*/,
     FailureMode:'#C026A3' /*magenta*/, MaintenanceTask:'#0F766E' /*deep teal*/,
     WorkOrder:'#9A6B00' /*ochre*/, Sensor:'#7B6BE0', Technician:'#475569'
   };
   ```
   Update both the render and the legend swatches. Minimum viable if time-boxed: at least recolor **Asset** off pure `#1499ff` and add a "categorical — not status" caption to the legend.
**Acceptance:** no graph node uses the four semantic hues with a conflicting meaning; legend swatches match render; status pills elsewhere unaffected.

### ⬜ P3 (nice-to-have, optional)
- **P3-1** `Graph explorer - Sigma (Linkurious).html`: breadcrumb says `forceatlas2` but it's a custom force layout — relabel to `force layout`, or wire real FA2 via an esbuild step.
- **P3-2** Commit a curated set of render PNGs (the five `NEW-*` heroes) to the PR, or attach inline — they're gitignored, so review currently needs a local checkout. (See `.gitignore`.)
- **P3-3** Add `letter-spacing:-.02em` to `h1,h2` in `linkurious-system.css` so Space Grotesk 700 better matches FKGrotesk-800 heft.

---

## Definition of done
- [ ] P1-1, P1-2, P2-1, P2-2, P2-3 implemented on `design/linkurious-direction`.
- [ ] Every `* (Linkurious).html` opens clean (no console errors) and matches its `NEW-*.png` reference, minus the fixed issues.
- [ ] No locked-system file or `main`-branch file modified.
- [ ] All product constraints still hold (spot-check: Ask isn't a chat, intent+confidence+params+plan visible, Results/Trace lineage works, write modal gated/amber, mono for IDs/Cypher).
- [ ] Commit per task with a clear message; push branch; comment on PR #1 linking this doc.
