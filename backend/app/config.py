"""Runtime configuration for the orchestration agent.

Values come from environment variables (12-factor); see ``.env.example``.
Secrets are NEVER baked into code or manifests — in a real deployment the
``*_password`` / DSN values resolve from a secrets manager (spec §13).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "orchestration-agent"
    log_level: str = "INFO"

    # Neo4j — the knowledge graph (spec §15).
    neo4j_uri: str = "bolt://neo4j:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "orchestrator"

    # Postgres — the append-only trace & lineage store (spec §10, §15).
    postgres_dsn: str = "postgresql://orchestrator:orchestrator@postgres:5432/trace"


settings = Settings()
