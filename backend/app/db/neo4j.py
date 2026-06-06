"""Neo4j driver wiring + a lightweight connectivity check.

This is infrastructure plumbing only — the parameterized Cypher template
layer (spec §5.4) is a later deliverable. The driver is created lazily and
shared process-wide; the core is stateless so this is safe to scale.
"""

from neo4j import AsyncGraphDatabase, AsyncDriver

from app.config import settings

_driver: AsyncDriver | None = None


def get_driver() -> AsyncDriver:
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
    return _driver


async def ping() -> None:
    """Raise if the graph is unreachable; return None on success."""
    async with get_driver().session() as session:
        result = await session.run("RETURN 1 AS ok")
        record = await result.single()
        if record is None or record["ok"] != 1:
            raise RuntimeError("unexpected response from Neo4j")


async def close() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
