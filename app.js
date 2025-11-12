// D3.js pie chart + responsive sizing (ES6-free)
var DEFAULT_DATA = [
  { label: "Wynd", value: 372 },
  { label: "Openbravo", value: 280 },
  { label: "Epos", value: 180 },
  { label: "Laura", value: 140 },
  { label: "Autre", value: 60 }
];
var STORAGE_KEY = "cockpit-pos-data-d3";

function $(sel){ return document.querySelector(sel); }
function formatTotal(rows){ var s=0; for(var i=0;i<rows.length;i++){ s+=Number(rows[i].value||0); } return s; }
function loadData(){ try{ var raw=localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): DEFAULT_DATA.slice(); }catch(e){ return DEFAULT_DATA.slice(); } }
function saveData(rows){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }catch(e){} }
function palette(i){ var P=["#3643BA","#20B6E5","#A9E34B","#FAB005","#EE6352","#845EF7","#12B886","#FF922B","#4263EB","#0CA678"]; return P[i%P.length]; }

// Build table
function buildTable(rows){
  var tbody = $("#data-table tbody"); if(!tbody) return; tbody.innerHTML = "";
  for(var i=0;i<rows.length;i++){
    var tr = document.createElement("tr");
    tr.innerHTML = '<td><input type="text" value="'+rows[i].label+'" data-idx="'+i+'" data-field="label"></td>' +
                   '<td class="num"><input type="number" min="0" step="1" value="'+rows[i].value+'" data-idx="'+i+'" data-field="value"></td>';
    tbody.appendChild(tr);
  }
  tbody.addEventListener("input", function(e){
    var t=e.target||e.srcElement; if(!t||!t.getAttribute)return;
    var idx=Number(t.getAttribute("data-idx")), field=t.getAttribute("data-field");
    var data=loadData(); if(field==="label") data[idx].label=t.value; if(field==="value") data[idx].value=Number(t.value||0);
    saveData(data); render(data);
  });
}

// D3 PIE
var svg = d3.select("#pie");
var gMain = svg.append("g");

function resizeAndRender(rows){
  var node = svg.node();
  var rect = node.getBoundingClientRect();
  var w = rect.width, h = rect.height;
  var r = Math.min(w, h) / 2 - 8; // padding
  svg.attr("viewBox", [ -w/2, -h/2, w, h ].join(" "));
  gMain.attr("transform", "translate(0,0)");

  var pie = d3.pie().value(function(d){ return Number(d.value||0); }).sort(null);
  var arcs = pie(rows);

  var arc = d3.arc().innerRadius(0).outerRadius(r);

  var join = gMain.selectAll("path").data(arcs, function(d){ return d.data.label; });
  join.enter().append("path")
      .attr("fill", function(d,i){ return palette(i); })
      .attr("d", arc)
      .append("title")
      .text(function(d){ return d.data.label + ": " + d.data.value; });
  join.attr("d", arc);
  join.exit().remove();
}

function buildLegend(rows){
  var legend = d3.select("#legend");
  var items = legend.selectAll(".item").data(rows, function(d){ return d.label; });
  var ent = items.enter().append("div").attr("class","item");
  ent.append("span").attr("class","dot").style("background", function(d,i){ return palette(i); });
  ent.append("span").text(function(d){ return " " + d.label + " — " + d.value; });
  items.select("span:nth-child(2)").text(function(d){ return " " + d.label + " — " + d.value; });
  items.exit().remove();
}

function updateTotal(rows){ $("#total").textContent = formatTotal(rows) + " caisses"; }

function render(rows){
  resizeAndRender(rows);
  buildLegend(rows);
  updateTotal(rows);
}

function setupButtons(){
  $("#add-row").onclick = function(){ var d=loadData(); d.push({label:"Nouvelle solution", value:0}); saveData(d); buildTable(d); render(d); };
  $("#sort-desc").onclick = function(){ var d=loadData().sort(function(a,b){return b.value-a.value}); saveData(d); buildTable(d); render(d); };
  $("#btn-reset").onclick = function(){ try{ localStorage.removeItem(STORAGE_KEY); }catch(e){} var d=loadData(); buildTable(d); render(d); toast("Valeurs réinitialisées"); };
  $("#btn-save").onclick = function(){ toast("Données sauvegardées dans votre navigateur"); };
}

function toast(msg){ var el=$("#toast"); el.textContent=msg; el.classList.add("show"); setTimeout(function(){ el.classList.remove("show"); },1600); }

// Handle resize
window.addEventListener("resize", function(){ render(loadData()); });

document.addEventListener("DOMContentLoaded", function(){
  var data = loadData();
  buildTable(data);
  render(data);
  setupButtons();
});
