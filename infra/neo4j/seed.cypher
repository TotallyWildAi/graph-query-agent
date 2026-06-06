// Seed the knowledge graph with the shared example data (ui-design-brief §2,
// orchestration-agent-spec §11) so the `assets_overdue_for_task` intent has
// real rows to return: pumps P-101 / P-104 / P-110 at SITE-NORTH overdue for
// LUBE-01. Idempotent — safe to re-run.

// --- Constraints: uniqueness on (label, business_id) (spec §11) ---
CREATE CONSTRAINT site_id        IF NOT EXISTS FOR (s:Site)            REQUIRE s.id   IS UNIQUE;
CREATE CONSTRAINT asset_id       IF NOT EXISTS FOR (a:Asset)           REQUIRE a.id   IS UNIQUE;
CREATE CONSTRAINT assetclass_id  IF NOT EXISTS FOR (c:AssetClass)      REQUIRE c.id   IS UNIQUE;
CREATE CONSTRAINT task_code      IF NOT EXISTS FOR (t:MaintenanceTask) REQUIRE t.code IS UNIQUE;
CREATE CONSTRAINT workorder_id   IF NOT EXISTS FOR (w:WorkOrder)       REQUIRE w.id   IS UNIQUE;

// --- Reference nodes ---
MERGE (s:Site {id: 'SITE-NORTH'})            SET s.name = 'North Plant';
MERGE (ac:AssetClass {id: 'CLASS-PUMP'})     SET ac.name = 'Centrifugal Pump';
MERGE (t:MaintenanceTask {code: 'LUBE-01'})  SET t.name = 'Lubrication', t.interval_days = 30;

// --- Three overdue pumps (due dates precede the 2026-06-07 scenario date) ---
UNWIND [
  {id: 'P-101', name: 'Pump P-101', due: date('2026-05-20'), status: 'OPEN'},
  {id: 'P-104', name: 'Pump P-104', due: date('2026-05-28'), status: 'IN_PROGRESS'},
  {id: 'P-110', name: 'Pump P-110', due: date('2026-06-01'), status: 'OPEN'}
] AS row
MATCH (s:Site {id: 'SITE-NORTH'})
MATCH (ac:AssetClass {id: 'CLASS-PUMP'})
MATCH (t:MaintenanceTask {code: 'LUBE-01'})
MERGE (a:Asset {id: row.id})            SET a.name = row.name
MERGE (s)-[:CONTAINS]->(a)
MERGE (a)-[:OF_TYPE]->(ac)
MERGE (wo:WorkOrder {id: 'WO-' + row.id}) SET wo.due_date = row.due, wo.status = row.status
MERGE (wo)-[:TARGETS]->(a)
MERGE (wo)-[:EXECUTES]->(t);
