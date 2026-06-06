# Review brief — "Linkurious" visual direction

**For:** a design-capable reviewer (e.g. claude.ai/design) with access to this repo.
**Branch:** `design/linkurious-direction` (make sure the local checkout is on this branch).
**Task:** review the new visual direction for quality + fidelity, then propose concrete fixes.

A "Linkurious" design direction has been added *alongside* the existing locked system — the locked
one is untouched. Review it, then propose fixes.

## Read these first, in order
- `CLAUDE.md` and `docs/ui-design-brief.md` §1 — the product constraints you must uphold.
- `design-reference/linkurious/STYLE.md` — the target aesthetic (measured from linkurious.com).
- `assets/linkurious-system.css` — the shared design system for this direction.
- The seven `* (Linkurious).html` screens, plus `Graph explorer (Linkurious).html` and
  `Graph explorer - Sigma (Linkurious).html`.
- Rendered screenshots in `design-reference/linkurious/`: ours are `NEW-*.png`; the Linkurious
  source reference is `home-*.png`, `product-*.png`, and `VID-frame-*.png`. **Compare ours to the
  reference** — your visual judgement should come from these PNGs (you can't render a live page).

## Hard constraints — do NOT break these (they define the product)
- It is **not a chatbot** — structured request box, never free-form chat chrome.
- **Transparency:** matched intent + confidence, extracted params, and the query/tools that ran must
  stay visible.
- **Lineage is first-class;** read vs write must be unmistakable.
- **Status encoding is a rule:** read = green, write = amber, error = red, accent = blue. Don't
  invent colors.
- **Master–detail** structure; monospace for IDs / Cypher / params.

## Evaluate and report on
1. Overall fidelity to the Linkurious aesthetic (type, spacing, color, motion) — adopt / iterate / drop?
2. Typography (Space Grotesk as the FKGrotesk substitute) and the status colors sitting beside the blue accent.
3. Consistency across all screens; anything that reads "off-brand" or heavy.
4. Known issues to confirm/fix:
   - A few **inline borders are still near-black** (Results table, Graph-schema node boxes, Ask
     modal, segmented toggles) — should be light hairlines.
   - The **Ask hero uses bespoke classes** instead of the shared `linkurious-system.css` (two
     definitions to maintain).
5. The two graph explorers vs the Linkurious graph-workspace reference (`VID-frame-*.png`).

## Deliverable
Prioritized findings (**P1 / P2 / P3**), each with the file + specific element, the problem, and a
**concrete fix (CSS/HTML snippet)** — preferring edits to the shared `assets/linkurious-system.css`
so they apply across screens. End with a one-line **verdict (adopt / iterate / drop)** and rationale.

## Scope guardrail
This is a **design review + targeted fixes, not a rewrite.** Do **not** modify the locked system
(`assets/console-system.css`, `assets/colors_and_type.css`, the non-`(Linkurious)` screens) or the
`main` branch. Keep all changes on `design/linkurious-direction`.
