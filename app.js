// ES5-compatible script with robust fallbacks
var DEFAULT_DATA = [
  { label: "Wynd", value: 420 },
  { label: "Openbravo", value: 280 },
  { label: "Epos", value: 180 },
  { label: "Laura", value: 140 },
  { label: "Autre", value: 60 }
];
var STORAGE_KEY = "cockpit-pos-data-v3";

function $(sel){ return document.querySelector(sel); }
function formatTotal(rows){ 
  var s = 0; for(var i=0;i<rows.length;i++){ s += Number(rows[i].value||0); } 
  return s; 
}

function loadData(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ return DEFAULT_DATA.slice(); }
    var arr = JSON.parse(raw);
    if(!(arr && arr.length)){ return DEFAULT_DATA.slice(); }
    for(var i=0;i<arr.length;i++){
      arr[i].label = String(arr[i].label||"");
      arr[i].value = Number(arr[i].value||0);
    }
    return arr;
  }catch(e){
    return DEFAULT_DATA.slice();
  }
}
function saveData(rows){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }catch(e){}
}

function buildTable(rows){
  var tbody = $("#data-table tbody");
  if(!tbody) return;
  tbody.innerHTML = "";
  for(var i=0;i<rows.length;i++){
    var tr = document.createElement("tr");
    tr.innerHTML = '<td><input type="text" value="'+rows[i].label+'" data-idx="'+i+'" data-field="label" aria-label="Nom de la solution"></td>' +
                   '<td class="num"><input type="number" min="0" step="1" value="'+rows[i].value+'" data-idx="'+i+'" data-field="value" aria-label="Nombre de caisses"></td>';
    tbody.appendChild(tr);
  }
  tbody.addEventListener("input", function(e){
    var t = e.target || e.srcElement;
    if(!t || !t.getAttribute) return;
    var idx = Number(t.getAttribute("data-idx"));
    var field = t.getAttribute("data-field");
    var data = loadData();
    if(field === "label") data[idx].label = t.value;
    if(field === "value") data[idx].value = Number(t.value||0);
    saveData(data); updateChart(data); updateTotal(data);
  });
}

var chart = null;
function updateChart(rows){
  var ctx = $("#pie");
  if(!ctx){ return; }
  var labels = [], data = [];
  for(var i=0;i<rows.length;i++){ labels.push(rows[i].label); data.push(rows[i].value); }
  try{
    if(typeof Chart === "undefined"){ throw new Error("Chart.js non chargé"); }
    if(!chart){
      chart = new Chart(ctx, {
        type:"pie",
        data:{ labels: labels, datasets:[{ data: data }] },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:function(c){ return c.label + ": " + c.raw + " caisses"; } } } }
        }
      });
    } else {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
    }
    // Légende
    var legend = $("#legend"); if(legend){ legend.innerHTML = ""; }
    var segs = (chart && chart._metasets && chart._metasets[0] && chart._metasets[0].data) ? chart._metasets[0].data : [];
    for(var j=0;j<rows.length;j++){
      if(!legend) break;
      var item = document.createElement("div"); item.className = "item";
      var dot = document.createElement("span"); dot.className = "dot";
      var color = segs[j] && segs[j].options && segs[j].options.backgroundColor ? segs[j].options.backgroundColor : "gray";
      dot.style.background = color;
      item.appendChild(dot);
      item.appendChild(document.createTextNode(" " + rows[j].label + " — " + rows[j].value));
      legend.appendChild(item);
    }
    var err = $("#chart-error"); if(err){ err.style.display = "none"; }
  }catch(e){
    var errEl = $("#chart-error");
    if(errEl){ errEl.style.display = "block"; errEl.textContent = "Le graphique ne peut pas s'afficher (" + e.message + ")."; }
  }
}

function updateTotal(rows){ var el = $("#total"); if(el){ el.textContent = formatTotal(rows) + " caisses"; } }

function setupButtons(){
  var btnAdd = $("#add-row"); if(btnAdd){ btnAdd.onclick = function(){ var data = loadData(); data.push({label:"Nouvelle solution", value:0}); saveData(data); buildTable(data); updateChart(data); updateTotal(data); }; }
  var btnSort = $("#sort-desc"); if(btnSort){ btnSort.onclick = function(){ var data = loadData(); data.sort(function(a,b){ return b.value - a.value; }); saveData(data); buildTable(data); updateChart(data); updateTotal(data); }; }
  var btnReset = $("#btn-reset"); if(btnReset){ btnReset.onclick = function(){ try{ localStorage.removeItem(STORAGE_KEY); }catch(e){} var data = loadData(); buildTable(data); updateChart(data); updateTotal(data); toast("Valeurs réinitialisées"); }; }
  var btnSave = $("#btn-save"); if(btnSave){ btnSave.onclick = function(){ toast("Données sauvegardées dans votre navigateur"); }; }
}

function toast(msg){
  var el = $("#toast"); if(!el) return;
  el.textContent = msg; el.classList.add("show");
  setTimeout(function(){ el.classList.remove("show"); }, 1600);
}

document.addEventListener("DOMContentLoaded", function(){
  var data = loadData();
  buildTable(data);
  updateChart(data);
  updateTotal(data);
  setupButtons();
});
