// Assemble the static design artifacts into dist/ for Cloudflare Pages
// (or any static host). No transformation — just collects the deliverables
// so we deploy the screens + assets and nothing else (no backend/, infra/,
// docs/, tools/). The graph engine bundle in assets/ is already committed.
import { cpSync, mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 1. Every top-level screen (.html) — filenames with spaces are preserved.
const html = readdirSync(root).filter((f) => f.endsWith(".html"));
for (const f of html) cpSync(join(root, f), join(dist, f));

// 2. The shared design system + bundled graph engine + brand mark.
cpSync(join(root, "assets"), join(dist, "assets"), { recursive: true });

if (!existsSync(join(dist, "index.html"))) {
  throw new Error("build failed: dist/index.html missing");
}
console.log(`Built static site → dist/  (${html.length} screens + assets/)`);
