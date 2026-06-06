/* =====================================================================
   Graph explorer (Sigma.js) — bundled entry
   graphology (model) + Sigma.js (WebGL renderer) + ForceAtlas2 (layout).
   Bundled to ../../assets/graph-explorer.bundle.js via `npm run build`.
   Drives the markup in "Graph explorer - Sigma.html".
   ===================================================================== */
import Graph from "graphology";
import Sigma from "sigma";
import forceAtlas2 from "graphology-layout-forceatlas2";

/* ---------------- DOMAIN GRAPH (maintenance KG, spec §11) ---------------- */
const TYPE = {
  Site:{color:"#0A0B0D",icon:"ph-buildings",size:18}, Asset:{color:"#1499FF",icon:"ph-gear-six",size:13},
  AssetClass:{color:"#8D8D8D",icon:"ph-tag",size:9}, Component:{color:"#46B3FF",icon:"ph-puzzle-piece",size:8},
  FailureMode:{color:"#E5484D",icon:"ph-warning",size:9}, MaintenanceTask:{color:"#19A05F",icon:"ph-wrench",size:10},
  WorkOrder:{color:"#E8973A",icon:"ph-clipboard-text",size:11}, Sensor:{color:"#7B6BE0",icon:"ph-broadcast",size:8},
  Reading:{color:"#B9BFC8",icon:"ph-pulse",size:5}, Technician:{color:"#475569",icon:"ph-user",size:9},
};
const PROPS = { Site:{region:"Northern"}, Asset:{status:"OPERATING"}, AssetClass:{}, Component:{}, FailureMode:{severity:"7 / 10"},
  MaintenanceTask:{interval_days:"90"}, WorkOrder:{status:"OPEN"}, Sensor:{type:"vibration"}, Reading:{}, Technician:{shift:"day"} };

const N = {}, L = [];
function add(id,type,label){ if(!N[id]) N[id]={id,type,label}; return N[id]; }
function lk(a,b,rel){ L.push({s:a,t:b,rel}); }
add("SITE-NORTH","Site","North Plant");
add("CC-CENTRIF","AssetClass","Centrifugal Pump"); add("CC-BOOST","AssetClass","Booster Pump");
const PUMPS=[["P-101","CC-CENTRIF"],["P-104","CC-CENTRIF"],["P-110","CC-BOOST"],["P-118","CC-CENTRIF"],["P-122","CC-BOOST"],
  ["P-130","CC-CENTRIF"],["P-141","CC-BOOST"],["P-150","CC-CENTRIF"],["P-163","CC-CENTRIF"],["P-177","CC-BOOST"],["P-188","CC-CENTRIF"],["P-195","CC-BOOST"]];
const TASKS=["LUBE-01","ALIGN-02","VIB-03"]; TASKS.forEach(t=>add(t,"MaintenanceTask",t));
const FMS=["Bearing wear","Seal leak","Misalignment"]; FMS.forEach((f,i)=>add("FM-"+i,"FailureMode",f));
add("TECH-AR","Technician","A. Rivera"); add("TECH-JL","Technician","J. Lind");
PUMPS.forEach(([p,cls],pi)=>{
  add(p,"Asset","Pump "+p); lk("SITE-NORTH",p,"CONTAINS"); lk(p,cls,"OF_TYPE");
  ["Bearing","Seal","Impeller"].forEach((c,ci)=>{
    const cid=p+"-"+c.slice(0,3).toUpperCase(); add(cid,"Component",c); lk(p,cid,"HAS_COMPONENT");
    lk(cid,"FM-"+(ci%FMS.length),"SUBJECT_TO");
    const sid=p+"-S"+ci; add(sid,"Sensor",c+" sensor"); lk(sid,cid,"MONITORS");
    const rid=p+"-R"+ci; add(rid,"Reading","reading"); lk(sid,rid,"EMITS");
  });
  FMS.forEach((_,fi)=>lk("FM-"+fi,TASKS[fi%TASKS.length],"MITIGATED_BY"));
  if(pi<6){ const wo="WO-"+(20480+pi); add(wo,"WorkOrder",wo); lk(wo,p,"TARGETS"); lk(wo,TASKS[pi%TASKS.length],"EXECUTES"); lk(pi%2?"TECH-JL":"TECH-AR",wo,"ASSIGNED_TO"); }
});
const adj = id => L.filter(l=>l.s===id||l.t===id).map(l=> l.s===id?l.t:l.s);
const degHidden = id => adj(id).filter(n=>!graph.hasNode(n)).length;
const nbCount = id => graph.hasNode(id) ? degHidden(id) : adj(id).length;  // expandable neighbours

/* ---------------- SIGMA + FORCEATLAS2 ---------------- */
let graph, renderer, fa2timer=null, sel=null;
let query="", autoExpand=true, acItems=[], acIdx=-1;
const $ = id => document.getElementById(id);

function boot(){
  try {
    graph = new Graph();
    renderer = new Sigma(graph, $("gx-sigma"), {
      renderLabels:true, labelFont:"Roboto", labelSize:12, labelWeight:"500",
      labelColor:{color:"#0A0B0D"}, defaultEdgeColor:"#C9CDD3", zIndex:true, minCameraRatio:0.05, maxCameraRatio:8,
    });
    renderer.on("clickNode", ({node})=>selectNode(node));
    renderer.on("clickStage", ()=>{ closeDetail(); closeAc(); });
    applyReducers();
    buildLegend();
    seed();
    // close the autocomplete when clicking outside the search
    document.addEventListener("mousedown", e=>{ if(!e.target.closest(".gx-searchwrap")) closeAc(); });
  } catch (e) {
    console.error(e);
    const err=$("gxErr"); if(err) err.classList.add("show");
    const c=$("gxCount"); if(c) c.textContent="render error";
  }
}

function addNode(id, near){
  if(graph.hasNode(id)) return;
  const n=N[id], t=TYPE[n.type];
  const ox = near?graph.getNodeAttribute(near,"x"):0, oy = near?graph.getNodeAttribute(near,"y"):0;
  graph.addNode(id,{ x:ox+(Math.random()-.5)*40, y:oy+(Math.random()-.5)*40, size:t.size, color:t.color,
    label:(n.type==="Reading"?"":n.label), ntype:n.type });
}
function syncEdges(){ L.forEach(l=>{ if(graph.hasNode(l.s)&&graph.hasNode(l.t)&&l.s!==l.t&&!graph.hasEdge(l.s,l.t)){ try{ graph.addEdgeWithKey(l.s+"->"+l.t,l.s,l.t,{label:l.rel,size:1.2,type:"line"}); }catch(e){} } }); }
function refreshCount(){ $("gxCount").textContent = graph.order+" node"+(graph.order!==1?"s":"")+" · "+graph.size+" edge"+(graph.size!==1?"s":"")+" · forceatlas2"; }

/* real ForceAtlas2: assign one iteration per animation frame, then cool down */
function runLayout(ms=2400){
  if(fa2timer) cancelAnimationFrame(fa2timer);
  if(graph.order<2) return;
  const settings = Object.assign(forceAtlas2.inferSettings(graph), {
    gravity:1.2, scalingRatio:12, slowDown:8,
    barnesHutOptimize: graph.order>100, adjustSizes:true, outboundAttractionDistribution:true,
  });
  const end = performance.now()+ms;
  (function loop(){
    forceAtlas2.assign(graph, { iterations:1, settings });
    if(performance.now()<end) fa2timer=requestAnimationFrame(loop);
  })();
}

/* ---------------- ACTIONS ---------------- */
function seed(){
  graph.clear(); sel=null; closeDetail();
  addNode("SITE-NORTH"); adj("SITE-NORTH").forEach(nb=>addNode(nb,"SITE-NORTH")); syncEdges();
  refreshCount(); runLayout(2400); setTimeout(fit,800);
}
function expand(id){ adj(id).forEach(nb=>addNode(nb,id)); syncEdges(); refreshCount(); runLayout(2200); }
function expandSelected(){ if(sel) expand(sel); }
function expandAll(){ Object.keys(N).forEach(id=>addNode(id)); syncEdges(); refreshCount(); runLayout(3600); setTimeout(fit,1600); }

function fit(){ if(renderer) renderer.getCamera().animatedReset({duration:500}); }
function zoomBy(dir){ const cam=renderer.getCamera(); dir==="in"?cam.animatedZoom(1.5):cam.animatedUnzoom(1.5); }
function centerOn(id){ try{ const d=renderer.getNodeDisplayData(id); if(d){ const cam=renderer.getCamera();
  cam.animate({x:d.x, y:d.y, ratio:Math.min(cam.getState().ratio,0.55)}, {duration:520}); } }catch(e){} }

/* bring a node into view (add if missing), optionally pull in its neighbours, select + center */
function focusNode(id, expandIt){
  const fresh = !graph.hasNode(id);
  if(fresh) addNode(id);
  if(expandIt) adj(id).forEach(nb=>addNode(nb,id));
  syncEdges(); refreshCount(); selectNode(id); runLayout(2200);
  setTimeout(()=>centerOn(id), fresh||expandIt ? 700 : 0);
}

function selectNode(id){
  sel=id; const n=N[id], t=TYPE[n.type];
  $("gxdIc").style.background=t.color;
  $("gxdIc").innerHTML=`<i class="ph ${t.icon}"></i>`;
  $("gxdKind").textContent=n.type;
  $("gxdName").textContent=n.label;
  $("gxdProps").innerHTML=Object.entries({id, ...PROPS[n.type]}).map(([k,v])=>`<span class="k">${k}</span><span class="v">${v}</span>`).join("");
  $("gxdProv").textContent=`source     neo4j\nnode_id    ${n.type[0].toLowerCase()}:${1000+Object.keys(N).indexOf(id)}\ntemplate   assets_overdue_for_task@3\ngraph_ver  2026-06-04T09:00Z`;
  const hid=degHidden(id), btn=$("gxdExpand");
  btn.style.display=hid>0?"inline-flex":"none"; btn.innerHTML=`<i class="ph ph-graph"></i> Expand ${hid} neighbour${hid!==1?"s":""}`;
  $("gxDetail").classList.add("open");
  applyReducers();
}
function closeDetail(){ $("gxDetail").classList.remove("open"); sel=null; applyReducers(); }

/* combined reducer: highlight the selection, dim non-matches while searching */
function applyReducers(){
  if(!renderer) return;
  renderer.setSetting("nodeReducer", (node, data)=>{
    if(node===sel) return {...data, highlighted:true, zIndex:3, forceLabel:true};
    if(query){ const n=N[node]; const hit=node.toLowerCase().includes(query)||(n&&n.label.toLowerCase().includes(query));
      if(!hit) return {...data, color:"#E4E5E8", label:"", zIndex:0}; }
    return data;
  });
}

/* ---------------- SEARCH + AUTOCOMPLETE ---------------- */
function acInput(q){
  query=q.trim().toLowerCase(); applyReducers();
  if(!query){ closeAc(); return; }
  const m = Object.values(N)
    .map(n=>({n, idx: (n.id.toLowerCase().includes(query)?n.id.toLowerCase().indexOf(query):99) }))
    .filter(x=> x.n.id.toLowerCase().includes(query) || x.n.label.toLowerCase().includes(query))
    .sort((a,b)=> a.idx-b.idx || a.n.id.localeCompare(b.n.id))
    .slice(0,8).map(x=>x.n);
  acItems=m; acIdx = m.length?0:-1; renderAc();
}
function renderAc(){
  const ac=$("gxAc");
  if(!acItems.length){ closeAc(); return; }
  ac.innerHTML = acItems.map((n,i)=>{
    const t=TYPE[n.type], cnt=nbCount(n.id), here=graph.hasNode(n.id);
    return `<div class="gx-ac-row${i===acIdx?' hot':''}" data-id="${n.id}" onmousedown="acPick('${n.id}',event)">
      <span class="acdot" style="background:${t.color}"></span>
      <span class="aclab">${n.label}</span><span class="acid">${n.id}</span>
      <span class="oc-spacer"></span>
      ${cnt>0 ? `<button class="ac-exp" title="Expand ${cnt} neighbour${cnt!==1?'s':''}" onmousedown="acExpand('${n.id}',event)">+${cnt}</button>`
              : `<span class="ac-here">${here?'shown':'leaf'}</span>`}
    </div>`;
  }).join("");
  ac.classList.add("open");
}
function acKey(e){
  if(!acItems.length){ if(e.key==="Escape") closeAc(); return; }
  if(e.key==="ArrowDown"){ e.preventDefault(); acIdx=(acIdx+1)%acItems.length; renderAc(); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); acIdx=(acIdx-1+acItems.length)%acItems.length; renderAc(); }
  else if(e.key==="Enter"){ e.preventDefault(); if(acIdx>=0) acPick(acItems[acIdx].id); }
  else if(e.key==="Escape"){ closeAc(); }
}
function acPick(id, e){ if(e){ e.preventDefault(); } focusNode(id, autoExpand); closeAc(); }
function acExpand(id, e){ e.preventDefault(); e.stopPropagation(); focusNode(id, true); renderAc(); }  // keep dropdown open, refresh +N
function closeAc(){ const ac=$("gxAc"); if(ac){ ac.classList.remove("open"); ac.innerHTML=""; } acItems=[]; acIdx=-1; }
function setAuto(on){ autoExpand=on; }

function buildLegend(){ $("gxLegend").innerHTML=Object.entries(TYPE).filter(([k])=>k!=="Reading"&&k!=="AssetClass")
  .map(([k,t])=>`<span class="lk"><span class="sw" style="background:${t.color}"></span>${k}</span>`).join(""); }

/* expose handlers used by inline onclick / oninput / onkeydown in the HTML */
Object.assign(window, { seed, expand, expandSelected, expandAll, fit, zoomBy, selectNode, closeDetail,
  acInput, acKey, acPick, acExpand, setAuto });
window.GXReady = true;
window.addEventListener("load", boot);
