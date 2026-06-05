// Variation B — Split workspace (confirmation pane + persistent plan panel)
window.OC_VAR_B = `
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

    <!-- request spans full width -->
    <div>
      <span class="oc-eyebrow">Request</span>
      <div class="oc-reqbox">
        <span class="q">Which pumps at the North plant are overdue for lubrication?</span>
        <span class="oc-btn ghost"><i class="ph ph-pencil-simple"></i> Edit</span>
        <span class="oc-btn primary"><i class="ph ph-play"></i> Re-run</span>
      </div>
    </div>

    <!-- two pane -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;">

      <!-- LEFT: confirmation -->
      <div class="oc-card" style="padding:20px;display:flex;flex-direction:column;gap:18px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="oc-eyebrow" style="margin:0;">Matched intent</span>
          <span class="oc-spacer"></span>
          <span class="oc-pill read"><span class="dot"></span>read</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <span class="oc-intent-name" style="font-size:18px;">assets_overdue_for_task</span>
          <div class="oc-conf">
            <span class="lbl">confidence</span>
            <span class="track" style="flex:1;"><span class="fill" style="width:92%;"></span></span>
            <span class="num">0.92</span>
          </div>
          <span class="oc-sub" style="font-size:12px;">High confidence — above the auto-run threshold. Confirm the parameters, then run.</span>
        </div>

        <div class="oc-divider"></div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <span class="oc-eyebrow" style="margin:0;">Parameters · editable</span>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <span class="oc-chip" style="justify-content:space-between;"><span><span class="key">site_id =</span> <span class="val">SITE-NORTH</span></span><span style="display:flex;gap:8px;align-items:center;"><span class="resolved">"North plant"</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span></span>
            <span class="oc-chip" style="justify-content:space-between;"><span><span class="key">task_code =</span> <span class="val">LUBE-01</span></span><span style="display:flex;gap:8px;align-items:center;"><span class="resolved">"lubrication"</span><span class="edit"><i class="ph ph-pencil-simple"></i></span></span></span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:8px;">
          <span class="oc-btn primary"><i class="ph ph-play"></i> Confirm &amp; run plan</span>
          <span class="oc-link"><i class="ph ph-tree-structure"></i> View full trace</span>
        </div>
      </div>

      <!-- RIGHT: persistent plan panel -->
      <div class="oc-card soft" style="padding:20px;background:var(--card-sunk);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <span class="oc-eyebrow" style="margin:0;">Execution plan</span>
          <span class="oc-spacer"></span>
          <span class="oc-pill dim"><span class="dot" style="background:var(--accent-cyan);"></span>step 3 of 5</span>
        </div>
        <div class="oc-steps">
          <div class="oc-step"><span class="mk done"><i class="ph ph-check"></i></span><div class="st"><div class="t">Classify intent</div><div class="d">done · 40 ms</div></div></div>
          <div class="oc-step"><span class="mk done"><i class="ph ph-check"></i></span><div class="st"><div class="t">Extract &amp; validate parameters</div><div class="d">done · 12 ms · 2/2 valid</div></div></div>
          <div class="oc-step is-run"><span class="mk run"><i class="ph ph-circle-notch"></i></span><div class="st"><div class="t">Run Cypher <span style="font-family:var(--font-mono);font-size:12px;">assets_overdue_for_task@3</span> <span class="oc-ro">read-only</span></div><div class="d">running…</div></div></div>
          <div class="oc-step pending"><span class="mk">4</span><div class="st"><div class="t">Enrich · <span style="font-family:var(--font-mono);font-size:12px;">snowflake_runtime_hours@2.1</span> <span class="oc-ro">read-only</span></div><div class="d">pending</div></div></div>
          <div class="oc-step pending"><span class="mk">5</span><div class="st"><div class="t">Assemble response &amp; attach lineage</div><div class="d">pending</div></div></div>
        </div>
        <div class="oc-divider" style="margin:12px 0;"></div>
        <span class="oc-sub" style="font-size:12px;">The plan is a persistent panel — it stays in view beside the request and animates as each registered step executes.</span>
      </div>

    </div>

    <div class="oc-foot"><span class="tag">B · split workspace —</span> &nbsp;Request spans the top; below it a <b>two-pane control room</b>: confirm intent + params on the left, watch the deterministic plan execute in a persistent panel on the right. Best for the "set intent, watch it run" model; both hardest elements stay visible at once.</div>

  </div>
</div>
`;
