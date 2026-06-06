# Linkurious — style reference (measured)

Captured from linkurious.com via Playwright (`design-reference/linkurious/capture.js` lives in scratch; screenshots + `tokens.json` here). This is a **reference for an inspired-by/close-mimic direction**, not an instruction to copy brand assets (logo, imagery, proprietary type). Linkurious is itself a graph-intelligence vendor — keep our own identity.

## Palette
| Role | Linkurious | Our mimic token |
|---|---|---|
| Primary accent | `#1499ff` (bright blue) | `--lk-blue: #1499ff` |
| Black / nav / footer | `#000` | `--lk-black: #0a0a0c` |
| Body text | `rgba(0,0,0,0.87)` | `--lk-ink` |
| Muted text | `#535353` / `#666` | `--lk-ink-soft` / `--lk-ink-faint` |
| Surfaces | `#fff`, `#f5f5f5`, `#eee` | `--lk-paper` / `--lk-surface` / `--lk-surface-2` |
| Hairline | `~#e6e6e6` | `--lk-line` |

**Status encoding is preserved from the product brief (hard rule), tuned to sit beside the blue:** read = green, write = amber, error = red, accent = blue (replaces the old cyan).

## Typography
- **Display / headings:** FKGrotesk (proprietary) at **800**, large (48–84px), tight line-height (~1.1). → substitute **Space Grotesk** (700) — closest free grotesque.
- **Body / UI:** **Roboto** 400/500, 16px base, 24px line-height.
- **Mono (IDs / Cypher / params — product rule):** **Roboto Mono** (aligns with Roboto, replaces JetBrains Mono in this direction).

## Shape & depth
- **Pill buttons:** border-radius 24–28px (we use `999px`).
- **Cards / inputs:** small radius, 5–8px (we use 8–12px).
- **Shadows:** mostly flat; occasional soft Material-ish shadow (`0 4px 24px rgba(0,0,0,.08)`).
- **Motion:** smooth `all .2s ease`; calm hover states.

## Layout idioms
- High-contrast **full-bleed sections** alternating black / white / bright-blue.
- Black top nav + black multi-column footer.
- **Network / particle motif** (concentric dot rings, filament graphs) in dark sections — on-theme for a knowledge-graph product; reused as a subtle rail accent.
- Generous whitespace, big bold headlines, card-based feature blocks.

## Applied in
`Console - Ask (Linkurious).html` — the Console / Ask hero rebuilt in this direction (built alongside the locked `assets/console-system.css`; that system is untouched). Same scenario data and product constraints (not-a-chatbot, transparency, lineage-first, gated writes).
