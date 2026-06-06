# Orchestration agent — backend

API core for the orchestration agent. **Infrastructure scaffold only** — this
exposes health/readiness probes that verify the Neo4j + Postgres wiring; the
orchestration logic (spec §5) is a later deliverable. See
[`docs/backend-infrastructure.md`](../docs/backend-infrastructure.md) for the
full picture.

## Run with the infra stack (recommended)

```bash
docker compose -f infra/docker-compose.yml up --build
```

→ API on http://localhost:8000 (`/health`, `/ready`, `/docs`).

## Run the API standalone (against an existing Neo4j + Postgres)

```bash
cd backend
python -m venv .venv && . .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                            # edit hosts to point at your services
uvicorn app.main:app --reload --port 8000
```

## Layout

| Path | Purpose |
|---|---|
| `app/main.py` | FastAPI app + `/health`, `/ready` |
| `app/config.py` | env-driven settings |
| `app/db/neo4j.py` | Neo4j driver + ping |
| `app/db/postgres.py` | Postgres pool + ping |

Configuration is environment-driven (see `.env.example`). Secrets come from the
environment locally and a secrets manager in production — never commit real
credentials.
