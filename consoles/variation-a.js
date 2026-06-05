// Variation A — Vertical flow (single column, document reading order)
window.OC_VAR_A = `
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

  <div class="oc-body" style="display:flex;flex-direction:column;gap:22px;">

    <!-- request -->
    <div>
      <span class="oc-eyebrow">Request</span>
      <div class="oc-reqbox">
        <span class="q">Which pumps at the North plant are overdue for lubrication?</span>
        <span class="oc-btn ghost"><i class="ph ph-pencil-simple"></i> Edit</span>
        <span class="oc-btn primary"><i class="ph ph-play"></i> Re-run</span>
      </div>
    </div>

    <!-- intent resolution band -->
    <div class="oc-card" style="padding:18px 20px;display:grid;grid-template-columns:1.1fr 1.3fr;gap:28px;">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <span class="oc-eyebrow">Matched intent</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="oc-intent-name">assets_overdue_for_task</span>
          <span class="oc-pill read"><span class="dot"></span>read</span>
        </div>
        <div class="oc-conf" style="grid-template-columns:1fr;">
          <span class="lbl">confidence</span>
          <span class="track" style="flex:1;"><span class="fill" style="width:92%;"></span></span>
          <span class="num">0.92</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;border-left:1.5px solid var(--ink-line);padding-left:28px;">
        <span class="oc-eyebrow">Extracted parameters · editable before run</span>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <span class="oc-chip"><span class="key">site_id =</span><span class="val">SITE-NORTH</span><span class="resolved">"North plant"</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span>
          <span class="oc-chip"><span class="key">task_code =</span><span class="val">LUBE-01</span><span class="resolved">"lubrication"</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span>
        </div>
        <span class="oc-sub" style="font-size:12px;">Resolved from your wording. Correct a chip to re-bind before the query runs.</span>
      </div>
    </div>

    <!-- plan -->
    <div class="oc-card soft" style="padding:18px 20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
        <span class="oc-eyebrow" style="margin:0;">Execution plan · 5 deterministic steps</span>
        <span class="oc-spacer"></span>
        <span class="oc-pill dim"><span class="dot" style="background:var(--accent-cyan);"></span>executing · step 3 of 5</span>
      </div>
      <div class="oc-steps">
        <div class="oc-step"><span class="mk done"><i class="ph ph-check"></i></span><div class="st"><div class="t">Classify intent → assets_overdue_for_task</div><div class="d">done · 40 ms</div></div></div>
        <div class="oc-step"><span class="mk done"><i class="ph ph-check"></i></span><div class="st"><div class="t">Extract &amp; validate parameters</div><div class="d">done · 12 ms · 2/2 valid</div></div></div>
        <div class="oc-step is-run"><span class="mk run"><i class="ph ph-circle-notch"></i></span><div class="st"><div class="t">Run Cypher template <span style="font-family:var(--font-mono);">assets_overdue_for_task@3</span> <span class="oc-ro">read-only</span></div><div class="d">running… binding $site_id, $task_code</div>
          <div class="oc-code" style="margin-top:8px;"><span class="kw">MATCH</span> (s:Site {id: <span class="pm">$site_id</span>})-[:CONTAINS]->(a:Asset)
<span class="kw">WHERE</span> wo.due_date &lt; date() <span class="kw">AND</span> wo.status &lt;&gt; 'CLOSED'</div>
        </div></div>
        <div class="oc-step pending"><span class="mk">4</span><div class="st"><div class="t">Enrich via tool <span style="font-family:var(--font-mono);">snowflake_runtime_hours@2.1</span> <span class="oc-ro">read-only</span></div><div class="d">pending</div></div></div>
        <div class="oc-step pending"><span class="mk">5</span><div class="st"><div class="t">Assemble response &amp; attach lineage</div><div class="d">pending</div></div></div>
      </div>
      <div class="oc-divider" style="margin:14px 0;"></div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="oc-link"><i class="ph ph-tree-structure"></i> View full trace</span>
        <span class="oc-spacer"></span>
        <span class="oc-btn ghost"><i class="ph ph-stop-circle"></i> Cancel run</span>
      </div>
    </div>

    <div class="oc-foot"><span class="tag">A · vertical flow —</span> &nbsp;Top-down reading order: request → resolution band → plan. Intent + confidence + params sit in one wide band; the plan reads as a <b>vertical timeline</b> that grows downward as it runs. Calmest / most document-like; scales to long traces.</div>

  </div>
</div>
`;
