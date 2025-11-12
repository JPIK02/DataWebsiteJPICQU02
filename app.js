// Pure JS + SVG pie chart, ES5 compatible
var DEFAULT_DATA = [
  { label: "Wynd", value: 420 },
  { label: "Openbravo", value: 280 },
  { label: "Epos", value: 180 },
  { label: "Laura", value: 140 },
  { label: "Autre", value: 60 }
];
var STORAGE_KEY = "cockpit-pos-data-v4";

function $(sel){ return document.querySelector(sel); }
function formatTotal(rows){ var s=0; for(var i=0;i<rows.length;i++){ s += Number(rows[i].value||0); } return s; }
function loadData(){ try{ var raw=localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): DEFAULT_DATA.slice(); }catch(e){ return DEFAULT_DATA.slice(); } }
function saveData(rows){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }catch(e){} }
function color(i){ var palette=["#3643BA","#22B8CF","#A9E34B","#FAB005","#EE6352","#845EF7","#12B886","#FF922B","#4263EB","#0CA678"]; return palette[i%palette.length]; }

function polarToCartesian(cx, cy, r, a){ var rad=(a-90)*Math.PI/180; return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) }; }

function drawPie(rows){
  var svg = $("#pie"); if(!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  var total = formatTotal(rows);
  if (total <= 0){ return; }

  var acc = 0, cx=0, cy=0, r=1;
  for(var i=0;i<rows.length;i++){
    var val = Number(rows[i].value||0);
    if(val<=0) continue;
    var start = acc / total * 360;
    var end = (acc + val) / total * 360;
    var startPt = polarToCartesian(cx, cy, r, end);
    var endPt = polarToCartesian(cx, cy, r, start);
    var largeArc = (end - start) > 180 ? 1 : 0;
    var path = document.createElementNS("http://www.w3.org/2000/svg","path");
    var d = ["M", startPt.x, startPt.y, "A", r, r, 0, largeArc, 0, endPt.x, endPt.y, "L", cx, cy, "Z"].join(" ");
    path.setAttribute("d", d);
    path.setAttribute("fill", color(i));
    svg.appendChild(path);
    acc += val;
  }
}

function buildLegend(rows){
  var legend = $("#legend"); if(!legend) return;
  legend.innerHTML = "";
  for(var i=0;i<rows.length;i++){
    var item = document.createElement("div"); item.className="item";
    var dot = document.createElement("span"); dot.className="dot"; dot.style.background=color(i);
    item.appendChild(dot);
    item.appendChild(document.createTextNode(" " + rows[i].label + " — " + rows[i].value));
    legend.appendChild(item);
  }
}

function buildTable(rows){
  var tbody = $("#data-table tbody"); if(!tbody) return;
  tbody.innerHTML = "";
  for(var i=0;i<rows.length;i++){
    var tr = document.createElement("tr");
    tr.innerHTML = '<td><input type="text" value="'+rows[i].label+'" data-idx="'+i+'" data-field="label"></td>' +
                   '<td class="num"><input type="number" min="0" step="1" value="'+rows[i].value+'" data-idx="'+i+'" data-field="value"></td>';
    tbody.appendChild(tr);
  }
  tbody.addEventListener("input", function(e){
    var t = e.target || e.srcElement;
    if(!t || !t.getAttribute) return;
    var idx = Number(t.getAttribute("data-idx"));
    var field = t.getAttribute("data-field");
    var data = loadData();
    if(field==="label") data[idx].label = t.value;
    if(field==="value") data[idx].value = Number(t.value||0);
    saveData(data); render(data);
  });
}

function setupButtons(){
  var btnAdd = $("#add-row"); if(btnAdd){ btnAdd.onclick = function(){ var d=loadData(); d.push({label:"Nouvelle solution", value:0}); saveData(d); buildTable(d); render(d); }; }
  var btnSort = $("#sort-desc"); if(btnSort){ btnSort.onclick = function(){ var d=loadData(); d.sort(function(a,b){return b.value-a.value}); saveData(d); buildTable(d); render(d); }; }
  var btnReset = $("#btn-reset"); if(btnReset){ btnReset.onclick = function(){ try{localStorage.removeItem(STORAGE_KEY);}catch(e){} var d=loadData(); buildTable(d); render(d); toast("Valeurs réinitialisées"); }; }
  var btnSave = $("#btn-save"); if(btnSave){ btnSave.onclick = function(){ toast("Données sauvegardées dans votre navigateur"); }; }
}

function updateTotal(rows){ var el=$("#total"); if(el){ el.textContent = formatTotal(rows) + " caisses"; } }

function toast(msg){ var el=$("#toast"); if(!el) return; el.textContent=msg; el.classList.add("show"); setTimeout(function(){ el.classList.remove("show"); },1600); }

function render(rows){ drawPie(rows); buildLegend(rows); updateTotal(rows); }

document.addEventListener("DOMContentLoaded", function(){
  var data = loadData();
  buildTable(data);
  render(data);
  setupButtons();
});
