// Données par défaut
const DEFAULT_DATA = [
  { label: "Wynd", value: 420 },
  { label: "Openbravo", value: 280 },
  { label: "Epos", value: 180 },
  { label: "Laura", value: 140 },
  { label: "Autre", value: 60 },
];
const STORAGE_KEY = "cockpit-pos-data-v2";

// Utils
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const formatTotal = (rows) => rows.reduce((s, r) => s + (r.value||0), 0);

// Storage
const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : DEFAULT_DATA;
    if (!Array.isArray(parsed)) return DEFAULT_DATA;
    return parsed.map(r => ({ label: String(r.label||""), value: Number(r.value||0)}));
  } catch { return DEFAULT_DATA; }
};
const saveData = (rows) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));

// Table
function buildTable(rows){
  const tbody = $("#data-table tbody");
  tbody.innerHTML = "";
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = \`
      <td><input type="text" value="\${row.label}" data-idx="\${idx}" data-field="label" aria-label="Nom de la solution"></td>
      <td class="num"><input type="number" min="0" step="1" value="\${row.value}" data-idx="\${idx}" data-field="value" aria-label="Nombre de caisses"></td>
    \`;
    tbody.appendChild(tr);
  });
  // Listeners (delegation)
  tbody.oninput = (e)=>{
    const t = e.target;
    if(!(t instanceof HTMLInputElement)) return;
    const idx = Number(t.dataset.idx);
    const field = t.dataset.field;
    const data = loadData();
    if(field === "label") data[idx].label = t.value;
    if(field === "value") data[idx].value = Number(t.value||0);
    saveData(data);
    updateChart(data);
    updateTotal(data);
  };
}

// Chart
let chart;
function updateChart(rows){
  const ctx = $("#pie");
  const labels = rows.map(r=>r.label);
  const data = rows.map(r=>r.value);
  if(!chart){
    chart = new Chart(ctx, {
      type: "pie",
      data: { labels, datasets: [{ data }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c)=> \`\${c.label}: \${c.raw} caisses\` } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
  // Legend
  const legend = $("#legend");
  legend.innerHTML = "";
  const segments = chart._metasets?.[0]?.data || [];
  rows.forEach((r, i) => {
    const item = document.createElement("div");
    item.className = "item";
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = segments[i]?.options?.backgroundColor || "gray";
    item.append(dot, document.createTextNode(` ${r.label} — ${r.value}`));
    legend.appendChild(item);
  });
}

// Total badge
function updateTotal(rows){
  $("#total").textContent = `${formatTotal(rows)} caisses`;
}

// Buttons
function setupButtons(rows){
  $("#add-row").onclick = () => {
    const data = loadData();
    data.push({ label: "Nouvelle solution", value: 0 });
    saveData(data);
    buildTable(data);
    updateChart(data);
    updateTotal(data);
  };
  $("#sort-desc").onclick = () => {
    const data = loadData().sort((a,b)=>b.value-a.value);
    saveData(data); buildTable(data); updateChart(data); updateTotal(data);
  };
  $("#btn-reset").onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    const data = loadData(); buildTable(data); updateChart(data); updateTotal(data);
    toast("Valeurs réinitialisées");
  };
  $("#btn-save").onclick = () => toast("Données sauvegardées dans votre navigateur");
}

// Tiny toast
function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"), 1600);
}

document.addEventListener("DOMContentLoaded", ()=>{
  const data = loadData();
  buildTable(data);
  updateChart(data);
  updateTotal(data);
  setupButtons();
});
