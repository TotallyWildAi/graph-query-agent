# Deploying to Cloudflare Pages

The **UI design artifacts** deploy to Cloudflare Pages with no real refactoring —
they're static HTML/CSS plus one committed JS bundle, with all data baked in and
**no calls to the backend**. This page covers deploying that static UI.

> **Scope:** UI only. The backend (FastAPI + Neo4j + Postgres) is **not** a good
> fit for Cloudflare Workers (Python + the Neo4j Bolt and `asyncpg` TCP drivers
> won't run there) and the databases can't be hosted on Cloudflare. Run the
> backend on a container host (Cloudflare Containers, Fly.io, Cloud Run, Railway…)
> with Neo4j (Aura) and Postgres external. See `docs/backend-infrastructure.md`.

## What gets deployed

`npm run build` runs `scripts/build-site.mjs`, which assembles a `dist/`
containing only the deliverables:

- every top-level `*.html` screen (filenames with spaces are preserved — browsers
  encode them as `%20` and Pages URL-decodes to match, exactly as nginx does today)
- `assets/` (the `console-system.css` design system, the `graph-explorer.bundle.js`
  graph engine, and the brand mark)

Nothing else ships — no `backend/`, `infra/`, `docs/`, or `tools/`.

Build settings (also in `wrangler.toml`):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Project name | `orchestration-console` |

## Option A — Git integration (recommended; auto-deploys on push)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `TotallyWildAi/graph-query-agent` repo.
3. Framework preset **None**; **Build command** `npm run build`; **Output directory** `dist`.
4. Save & Deploy. Every push to `main` publishes; PRs get preview URLs.

## Option B — Direct upload from your machine (fastest one-off)

```bash
# one-time: authenticate wrangler against your Cloudflare account
#   (interactive / opens a browser — run it yourself)
npx wrangler login

# build + publish
npm run deploy            # = npm run build && wrangler pages deploy dist
```

The first `wrangler pages deploy` prompts to create the `orchestration-console`
project; subsequent runs publish a new deployment and print the live URL
(`https://orchestration-console.pages.dev`).

## Local preview (Pages runtime, no Cloudflare account)

```bash
npm run preview           # = build + wrangler pages dev dist  → http://localhost:8788
```

## Notes

- **Fonts & icons** load from CDNs (Google Fonts, Phosphor). Pages serves over
  HTTPS, so those load fine; no assets are vendored.
- **Custom domain:** add it under the Pages project → *Custom domains*.
- **Regenerating the graph bundle** is unrelated to deploying — the bundle is
  committed; only changing it needs `npm install && npm run build` in
  `tools/graph-explorer/`.
