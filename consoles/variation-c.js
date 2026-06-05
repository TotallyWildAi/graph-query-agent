// Variation C — Pipeline console (command bar, horizontal pipeline, active-step inspector)
window.OC_VAR_C = `
<aside class="oc-rail">
  <div class="oc-brand"><img src="assets/tw-stamp-light.svg" alt=""><div class="wm">Console<small>orchestration</small></div></div>
  <div class="oc-navgrp">Workspace</div>
  <div class="oc-nav on"><i class="ph ph-terminal-window"></i> Ask</div>
  <div class="oc-nav"><i class="ph ph-clock-counter-clockwise"></i> History</div>
  <div class="oc-navgrp">Reference</div>
  <div class="oc-nav"><i class="ph ph-list-checks"></i> Intent catalogue</div>
  <div class="oc-nav"><i class="ph ph-plugs"></i> Tool registry</div>
  <div class="oc-rail-foot">Read-only by default.<br>Writes are gated, logged capabilities.</div>
</aside>

<div class="oc-main">
  <div class="oc-top">
    <span class="crumb">Workspace / <b>Ask</b></span>
    <span class="oc-spacer"></span>
    <span class="oc-meta">request_id <b>req_7f3a9c21</b></span>
    <span class="oc-meta">graph_version <b>2026-06-04T09:00Z</b></span>
  </div>

  <div class="oc-body" style="display:flex;flex-direction:column;gap:18px;">

    <!-- command bar -->
    <div>
      <span class="oc-eyebrow">Request</span>
      <div class="oc-reqbox cmd">
        <span class="promptmark">&gt;_</span>
        <span class="q">Which pumps at the North plant are overdue for lubrication?</span>
        <span class="oc-btn primary"><i class="ph ph-play"></i> Run</span>
      </div>
    </div>

    <!-- resolution strip -->
    <div class="oc-card" style="padding:12px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <span style="font-family:var(--font-mono);color:var(--accent);font-size:13px;">→ resolved</span>
      <span class="oc-intent-name">assets_overdue_for_task</span>
      <span class="oc-pill read"><span class="dot"></span>read</span>
      <span style="display:flex;align-items:center;gap:7px;"><span class="oc-conf" style="gap:7px;"><span class="track" style="width:72px;"><span class="fill" style="width:92%;"></span></span><span class="num">0.92</span></span></span>
      <span style="width:1.5px;height:22px;background:var(--ink-line);"></span>
      <span class="oc-chip"><span class="key">site_id =</span><span class="val">SITE-NORTH</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span>
      <span class="oc-chip"><span class="key">task_code =</span><span class="val">LUBE-01</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span>
      <span class="oc-spacer"></span>
      <span class="oc-sub" style="font-size:11.5px;">edit a chip to re-bind</span>
    </div>

    <!-- horizontal pipeline -->
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <span class="oc-eyebrow" style="margin:0;">Deterministic pipeline</span>
        <span class="oc-spacer"></span>
        <span class="oc-pill dim"><span class="dot" style="background:var(--accent-cyan);"></span>executing · 3 / 5 · 0.42s elapsed</span>
      </div>
      <div class="oc-pipe">
        <div class="oc-pnode"><div class="pn-top"><span class="pn-mk done"><i class="ph ph-check"></i></span><span class="pn-conn">→</span></div><div class="pn-t">Classify</div><div class="pn-d">40 ms</div></div>
        <div class="oc-pnode"><div class="pn-top"><span class="pn-mk done"><i class="ph ph-check"></i></span><span class="pn-conn">→</span></div><div class="pn-t">Validate params</div><div class="pn-d">12 ms · 2/2</div></div>
        <div class="oc-pnode run"><div class="pn-top"><span class="pn-mk"><i class="ph ph-circle-notch"></i></span><span class="pn-conn">→</span></div><div class="pn-t">Cypher query <span class="oc-ro">read</span></div><div class="pn-d">running…</div></div>
        <div class="oc-pnode pending"><div class="pn-top"><span class="pn-mk">4</span><span class="pn-conn">→</span></div><div class="pn-t">Enrich · Snowflake <span class="oc-ro">read</span></div><div class="pn-d">pending</div></div>
        <div class="oc-pnode pending"><div class="pn-top"><span class="pn-mk">5</span></div><div class="pn-t">Assemble lineage</div><div class="pn-d">pending</div></div>
      </div>
    </div>

    <!-- active step inspector -->
    <div class="oc-card" style="padding:18px 20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span class="oc-pill dim" style="border-color:var(--accent);color:var(--accent);"><span class="dot" style="background:var(--accent);"></span>step 3 · active</span>
        <span class="oc-h">Run Cypher template</span>
        <span style="font-family:var(--font-mono);font-size:13px;color:var(--ink-soft);">assets_overdue_for_task@3</span>
        <span class="oc-ro">read-only</span>
        <span class="oc-spacer"></span>
        <span class="oc-sub" style="font-family:var(--font-mono);font-size:11px;">node guard · cost guard ✓</span>
      </div>
      <div class="oc-code"><span class="kw">MATCH</span> (s:Site {id: <span class="pm">$site_id</span>})-[:CONTAINS]->(a:Asset)
<span class="kw">MATCH</span> (a)&lt;-[:TARGETS]-(wo:WorkOrder)-[:EXECUTES]->(t:MaintenanceTask {code: <span class="pm">$task_code</span>})
<span class="kw">WHERE</span> wo.due_date &lt; date() <span class="kw">AND</span> wo.status &lt;&gt; 'CLOSED'
<span class="kw">RETURN</span> a.id, a.name, wo.due_date, wo.status <span class="kw">ORDER BY</span> wo.due_date</div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:14px;">
        <span style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-soft);">bound · $site_id = "SITE-NORTH" · $task_code = "LUBE-01"</span>
        <span class="oc-spacer"></span>
        <span class="oc-link"><i class="ph ph-tree-structure"></i> View full trace</span>
      </div>
    </div>

    <div class="oc-foot"><span class="tag">C · pipeline console —</span> &nbsp;A <b>command bar</b> + a one-line resolution strip (intent · confidence · param chips), then the plan as a <b>horizontal pipeline</b> with an inspector for the active step. Densest / most "ops console"; foregrounds the deterministic pipeline and the evidence of the running step.</div>

  </div>
</div>
`;
