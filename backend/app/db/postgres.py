"""Postgres connection pool + a lightweight connectivity check.

Postgres is the append-only trace & lineage store (spec §10). This module
only establishes the pool and verifies reachability; writing trace/lineage
records is a later deliverable. Schema is provisioned by
``infra/postgres/init.sql`` at first boot.
"""

import asyncpg

from app.config import settings

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.postgres_dsn, min_size=1, max_size=5)
    return _pool


async def ping() -> None:
    """Raise if the trace store is unreachable; return None on success."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        value = await conn.fetchval("SELECT 1")
        if value != 1:
            raise RuntimeError("unexpected response from Postgres")


async def close() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
