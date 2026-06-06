-- Trace & lineage store (orchestration-agent-spec §10).
--
-- APPEND-ONLY BY CONVENTION: the orchestrator only ever INSERTs. These tables
-- form the audit log and the basis for deterministic replay — rows are never
-- updated or deleted in normal operation. The grant at the bottom enforces that
-- for the application role.

-- One row per request handled by the gateway.
CREATE TABLE IF NOT EXISTS requests (
    request_id    TEXT        PRIMARY KEY,
    intent        TEXT,
    confidence    REAL,
    parameters    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    status        TEXT        NOT NULL DEFAULT 'received',
    graph_version TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The ordered plan: one row per planned/executed step (spec §5.3).
CREATE TABLE IF NOT EXISTS steps (
    id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id  TEXT        NOT NULL REFERENCES requests (request_id),
    seq         INT         NOT NULL,
    kind        TEXT        NOT NULL,   -- 'cypher' | 'tool'
    ref         TEXT,                   -- template id or tool name@version
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (request_id, seq)
);

-- One row per Cypher template execution, with the node IDs touched (spec §5.4).
CREATE TABLE IF NOT EXISTS query_records (
    id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id  TEXT        NOT NULL REFERENCES requests (request_id),
    template_id TEXT        NOT NULL,   -- e.g. 'assets_overdue_for_task@3'
    params      JSONB       NOT NULL DEFAULT '{}'::jsonb,
    node_ids    TEXT[]      NOT NULL DEFAULT '{}',
    row_count   INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per registered-tool invocation, with normalised I/O (spec §5.6).
CREATE TABLE IF NOT EXISTS tool_records (
    id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id  TEXT        NOT NULL REFERENCES requests (request_id),
    tool        TEXT        NOT NULL,
    version     TEXT        NOT NULL,
    input       JSONB       NOT NULL DEFAULT '{}'::jsonb,
    output      JSONB,
    source      TEXT,                   -- external system, e.g. 'snowflake'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provenance per output field (spec §10 "lineage record").
CREATE TABLE IF NOT EXISTS lineage (
    id            BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id    TEXT        NOT NULL REFERENCES requests (request_id),
    field         TEXT        NOT NULL,
    value         TEXT,
    source        TEXT        NOT NULL,   -- 'neo4j' | external system
    produced_by   JSONB       NOT NULL,   -- {template, node_ids} or {tool, version, payload_hash}
    graph_version TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_steps_request   ON steps (request_id);
CREATE INDEX IF NOT EXISTS idx_query_request   ON query_records (request_id);
CREATE INDEX IF NOT EXISTS idx_tool_request    ON tool_records (request_id);
CREATE INDEX IF NOT EXISTS idx_lineage_request ON lineage (request_id);

-- Enforce append-only for the application role: it may INSERT and SELECT, but
-- not UPDATE or DELETE. (The POSTGRES_USER bootstrap role still owns the schema;
-- a real deployment would run the app under a separate least-privilege role.)
REVOKE UPDATE, DELETE, TRUNCATE
    ON requests, steps, query_records, tool_records, lineage
    FROM PUBLIC;
