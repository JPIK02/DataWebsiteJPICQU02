// Cockpit POS Program — dynamic pie with localStorage persistence
const DEFAULT_DATA = [
  { label: "Wynd", value: 420 },
  { label: "Openbravo", value: 280 },
  { label: "Epos", value: 180 },
  { label: "Laura", value: 140 },
  { label: "Other", value: 60 },
];

const STORAGE_KEY = "cockpit-pos-data-v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.every(r => r.label && typeof r.value === "number")) return arr;
    return DEFAULT_DATA;
  } catch { return DEFAULT_DATA; }
}

function saveData(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function buildTable(rows) {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = \`
      <td><input type="text" value="\${row.label}" data-idx="\${idx}" data-field="label" aria-label="POS solution name"></td>
      <td><input type="number" min="0" step="1" value="\${row.value}" data-idx="\${idx}" data-field="value" aria-label="Number of tills"></td>
    \`;
    tbody.appendChild(tr);
  });
  const trAdd = document.createElement("tr");
  trAdd.innerHTML = '<td colspan="2"><button id="add-row" type="button">+ Add row</button></td>';
  tbody.appendChild(trAdd);

  tbody.addEventListener("input", onTableEdit);
  document.getElementById("add-row").addEventListener("click", () => {
    rows.push({ label: "New", value: 0 });
    saveData(rows);
    buildTable(rows);
    updateChart(rows);
  });
}

function onTableEdit(e) {
  const t = e.target;
  if (!(t instanceof HTMLInputElement)) return;
  const idx = Number(t.dataset.idx);
  const field = t.dataset.field;
  const rows = loadData();
  if (field === "label") rows[idx].label = t.value;
  if (field === "value") rows[idx].value = Number(t.value || 0);
  saveData(rows);
  updateChart(rows);
}

let chart;

function updateChart(rows) {
  const ctx = document.getElementById("pie");
  const labels = rows.map(r => r.label);
  const data = rows.map(r => r.value);
  if (!chart) {
    chart = new Chart(ctx, {
      type: "pie",
      data: { labels, datasets: [{ data }] },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => \`\${c.label}: \${c.raw} tills\` } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
  // Build legend
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  const meta = chart._metasets?.[0]?.data || [];
  rows.forEach((r, i) => {
    const item = document.createElement("div");
    item.className = "item";
    const dot = document.createElement("span");
    dot.className = "dot";
    const color = meta[i]?.options?.backgroundColor || "gray";
    dot.style.background = color;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(\` \${r.label} — \${r.value}\`));
    legend.appendChild(item);
  });
}

function setupButtons() {
  document.getElementById("btn-save").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Data saved locally in your browser.");
  });
  document.getElementById("btn-reset").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEY);
    const rows = loadData();
    buildTable(rows);
    updateChart(rows);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const rows = loadData();
  buildTable(rows);
  updateChart(rows);
  setupButtons();
});
