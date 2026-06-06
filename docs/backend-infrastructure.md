# Backend infrastructure wiring

> **Status:** infrastructure scaffold. This document records what backing
> infrastructure the [orchestration-agent spec](orchestration-agent-spec.md)
> requires and wires up a local-dev stack for it. The orchestration logic
> itself (intent router, planner, Cypher template layer, tool registry,
> lineage assembler — spec §5) is **not** implemented here; this PR stands up
> the services those components will depend on and proves connectivity.

Until now this repo held only UI design artifacts (no backend, no database).
This is the first backend-facing PR.

## What the spec requires

Distilled from the spec's tech stack (§15), observability (§14), lineage
(§10), and security (§13):

| Service | Role | Spec ref | Status in this PR |
|---|---|---|---|
| **Neo4j** | Knowledge graph; parameterized read-only Cypher | §5.4, §11, §15 | ✅ wired + seeded |
| **Postgres** | Append-only trace & lineage store; replay basis | §5.8, §10, §15 | ✅ wired + schema |
| **FastAPI core** | API gateway, router, planner, assembler | §5.1–§5.7, §15 | ◑ scaffold (health/readiness only) |
| **Secrets manager** | Resolve `secret_ref` for tools / DB creds | §9, §13 | ⏳ deferred (env vars for local) |
| **OpenTelemetry** | Tracing + metrics across the request path | §14, §15 | ⏳ deferred (next PR) |
| **External adapters** (Snowflake/SAP/CMMS) | Registered tools behind a uniform `invoke()` | §8, §9 | ⏳ deferred (tool-registry PR) |

Langfuse (LLM-call observability for the intent-classification/param-extraction
model) was considered and **deliberately deferred** — there is no model call to
observe yet, and it pulls in its own ClickHouse/Redis/MinIO stack. It slots in
alongside the router when that lands.

## What this PR delivers

```
infra/
  docker-compose.yml      Neo4j + Postgres + API core (local dev)
  neo4j/seed.cypher       constraints + shared example data (SITE-NORTH pumps)
  postgres/init.sql       append-only trace/lineage schema (spec §10)
backend/
  app/main.py             FastAPI app: /health (liveness), /ready (deps)
  app/config.py           env-driven settings (pydantic-settings)
  app/db/neo4j.py         Neo4j driver + ping
  app/db/postgres.py      Postgres pool + ping
  Dockerfile, requirements.txt, .env.example
```

The trace store schema mirrors the spec's lineage model: `requests` → `steps`
→ `query_records` / `tool_records` → `lineage` (one provenance row per output
field). Tables are append-only — `UPDATE`/`DELETE`/`TRUNCATE` are revoked from
`PUBLIC`.

Neo4j is seeded with the repo's shared example data so the canonical
`assets_overdue_for_task` query has real rows: pumps **P-101 / P-104 / P-110**
at **SITE-NORTH** overdue for **LUBE-01**.

## Running it

From the repo root:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Endpoints once healthy:

| Service | URL | Notes |
|---|---|---|
| API — liveness | http://localhost:8000/health | `{"status":"ok"}` |
| API — readiness | http://localhost:8000/ready | pings Neo4j + Postgres; 200 / 503 |
| API — OpenAPI docs | http://localhost:8000/docs | FastAPI auto-docs |
| Neo4j Browser | http://localhost:7475 | user `neo4j`, pass `orchestrator` |
| Postgres | `localhost:5432` | db `trace`, user/pass `orchestrator` |

> Host ports for Neo4j are remapped off the defaults (Browser `7475→7474`,
> Bolt `7688→7687`) so this stack coexists with any other local Neo4j.
> Inside the compose network the API still reaches it at `bolt://neo4j:7687`.

Verify the seed against the canonical intent:

```cypher
MATCH (s:Site {id:'SITE-NORTH'})-[:CONTAINS]->(a:Asset)
MATCH (a)<-[:TARGETS]-(wo:WorkOrder)-[:EXECUTES]->(t:MaintenanceTask {code:'LUBE-01'})
WHERE wo.due_date < date() AND wo.status <> 'CLOSED'
RETURN a.id AS asset_id, a.name AS asset, wo.due_date AS due, wo.status AS status
ORDER BY wo.due_date ASC;
```

Tear down (and drop volumes to re-seed from scratch):

```bash
docker compose -f infra/docker-compose.yml down -v
```

> **Note:** this stack is separate from the root `docker-compose.yml`, which
> only serves the static design artifacts on :8080. The default credentials
> here are for local dev only; production resolves them from a secrets manager
> (spec §13).

## Next steps (out of scope here)

1. Cypher template layer + the first read intents end-to-end with lineage
   writes (spec phase 1).
2. Tool registry + invoker; first external read adapter (phase 2).
3. Deterministic intent router + parameter extraction + Langfuse (phase 3).
4. OpenTelemetry collector + instrumentation (§14).
