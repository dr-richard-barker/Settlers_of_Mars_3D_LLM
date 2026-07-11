/* AstroBotany BioSim Lite — a simplified, in-browser bioregenerative
   life-support (BLSS) mass-balance sandbox.

   This is an EDUCATIONAL model. It captures the qualitative dynamics of the
   TRACLabs BioSim modules (crew ↔ air revitalization ↔ water recovery ↔
   biomass/crops ↔ stores) using illustrative per-day values. It is NOT
   flight-validated. For the full validated model see the links on the page. */

(function () {
  "use strict";

  // ---- Per-crew metabolic rates (kg / person / day), approx NASA BVAD-scale ----
  var CREW = { o2: 0.82, co2: 1.00, water: 3.60, food: 0.62 };
  var O2_PER_CO2 = 32 / 44; // O2 mass recoverable per unit CO2 mass

  // ---- Crop performance per m² per day (illustrative educational values) ----
  //  o2   = O2 produced, food = edible dry mass, water = transpiration,
  //  mass = system mass per m² (structure + lighting), incl. its power draw.
  var CROPS = {
    wheat:   { label: "Wheat (staple)",     o2: 0.025, food: 0.013, water: 2.0, mass: 9 },
    potato:  { label: "White potato (calorie-dense)", o2: 0.020, food: 0.020, water: 1.6, mass: 8 },
    soybean: { label: "Soybean (protein/oil)", o2: 0.020, food: 0.010, water: 1.8, mass: 9 },
    lettuce: { label: "Lettuce (salad)",    o2: 0.015, food: 0.006, water: 1.2, mass: 7 },
    tomato:  { label: "Tomato (salad/vitamins)", o2: 0.018, food: 0.008, water: 1.5, mass: 8 },
    mixed:   { label: "Mixed garden (balanced)", o2: 0.021, food: 0.012, water: 1.7, mass: 8 }
  };

  // ---- Fixed mass terms for the ESM (Equivalent System Mass) proxy, kg ----
  var HAB_MASS_PER_CREW = 500;
  var TANK_FACTOR = 1.2;      // store mass = stored kg × this
  var ARS_BASE = 200, ARS_SPAN = 800;  // air revitalization mass grows with efficiency
  var WRS_BASE = 150, WRS_SPAN = 600;  // water recovery mass grows with efficiency

  var STORAGE_KEY = "astrobiosim.runs.v1";
  var MAX_SOLS = 1000; // cap the forward run

  // -------------------------------------------------------------------------
  function readInputs() {
    var g = function (id) { return document.getElementById(id); };
    var cropKey = g("crop").value;
    return {
      crew: +g("crew").value,
      area: +g("area").value,
      crop: cropKey,
      arsEff: +g("ars").value / 100,
      wrsEff: +g("wrs").value / 100,
      reserveDays: +g("reserve").value,
      name: (g("runname").value || "").trim()
    };
  }

  // Core mass-balance model. Returns net daily balances, stores, mission
  // length, sustainability, and an ESM proxy.
  function simulate(p) {
    var crop = CROPS[p.crop];
    var N = p.crew, A = p.area;

    // Daily supply/demand (kg/day)
    var o2Supply   = crop.o2 * A + p.arsEff * CREW.co2 * N * O2_PER_CO2;
    var o2Demand   = CREW.o2 * N;
    var foodSupply = crop.food * A;
    var foodDemand = CREW.food * N;
    // Water is conserved, not generated: crop transpiration is recycled irrigation
    // (a loop, not a source). Net loss = crew water not recovered by the WRS,
    // partly offset by water the CRS makes while reclaiming CO₂.
    var waterSupply = p.arsEff * CREW.co2 * N * 0.30;      // CRS by-product water
    var waterDemand = CREW.water * N * (1 - p.wrsEff);     // un-recovered crew water

    var net = {
      o2:   o2Supply - o2Demand,
      food: foodSupply - foodDemand,
      water: waterSupply - waterDemand
    };

    // Initial stores sized from a "reserve days" buffer of gross demand (kg)
    var store0 = {
      o2:   p.reserveDays * CREW.o2 * N,
      food: p.reserveDays * CREW.food * N,
      water: p.reserveDays * CREW.water * N
    };

    // Forward run: deplete/accumulate each store; mission ends when one hits 0
    var series = { sol: [], o2: [], food: [], water: [] };
    var store = { o2: store0.o2, food: store0.food, water: store0.water };
    var missionSol = MAX_SOLS, failResource = null;
    for (var s = 0; s <= MAX_SOLS; s++) {
      series.sol.push(s);
      series.o2.push(store.o2);
      series.food.push(store.food);
      series.water.push(store.water);
      if (s > 0 && (store.o2 <= 0 || store.food <= 0 || store.water <= 0)) {
        missionSol = s;
        failResource = store.o2 <= 0 ? "oxygen" : (store.food <= 0 ? "food" : "water");
        break;
      }
      store.o2   += net.o2;
      store.food += net.food;
      store.water += net.water;
    }

    var sustainable = net.o2 >= 0 && net.food >= 0 && net.water >= 0;

    // ESM proxy (kg): lower is better
    var storeKg = store0.o2 + store0.food + store0.water;
    var esm = HAB_MASS_PER_CREW * N
            + crop.mass * A
            + storeKg * TANK_FACTOR
            + (ARS_BASE + ARS_SPAN * p.arsEff)
            + (WRS_BASE + WRS_SPAN * p.wrsEff);

    // Closure %: share of each resource met by regeneration (crops+recycling)
    var closure = {
      o2:   pct(o2Supply,   o2Demand),
      food: pct(foodSupply, foodDemand),
      water: pct(waterSupply + CREW.water * N * p.wrsEff, CREW.water * N)
    };

    return {
      params: p, crop: crop, net: net, store0: store0, series: series,
      missionSol: missionSol, failResource: failResource,
      sustainable: sustainable, esm: Math.round(esm), closure: closure,
      areaPerCrew: N ? +(A / N).toFixed(1) : 0
    };
  }

  function pct(supply, demand) {
    if (demand <= 0) return 100;
    return Math.min(999, Math.round((supply / demand) * 100));
  }

  // -------------------------------------------------------------------------
  // Rendering
  function fmt(n) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
  function signed(n) { return (n >= 0 ? "+" : "") + n.toFixed(2); }

  function renderResults(r) {
    var el = document.getElementById("results");
    var verdict = r.sustainable
      ? '<span class="pill done">✅ Closed-loop sustainable</span>'
      : '<span class="pill wip">⚠️ Store-limited — runs out of ' + r.failResource + '</span>';
    var life = r.sustainable ? "Indefinite" : (fmt(r.missionSol) + " sols");
    el.innerHTML =
      '<div class="verdict">' + verdict + '</div>' +
      '<div class="stat-row">' +
        stat("Mission length", life) +
        stat("ESM (system mass)", fmt(r.esm) + " kg") +
        stat("Crop area / crew", r.areaPerCrew + " m²") +
      '</div>' +
      '<table class="bal"><thead><tr><th>Resource</th><th>Net / sol (kg)</th><th>Regeneration</th></tr></thead><tbody>' +
        balRow("Oxygen", r.net.o2, r.closure.o2) +
        balRow("Food",   r.net.food, r.closure.food) +
        balRow("Water",  r.net.water, r.closure.water) +
      '</tbody></table>';
    drawLine(document.getElementById("chart"), r);
  }

  function stat(label, val) {
    return '<div class="stat"><span class="stat-v">' + val + '</span><span class="stat-l">' + label + '</span></div>';
  }
  function balRow(name, net, closurePct) {
    var cls = net >= 0 ? "ok" : "bad";
    return '<tr><td>' + name + '</td><td class="' + cls + '">' + signed(net) +
           '</td><td>' + closurePct + '%</td></tr>';
  }

  // Reserves-over-time line chart (vanilla canvas)
  function drawLine(canvas, r) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height, pad = 34;
    ctx.clearRect(0, 0, W, H);
    var solMax = Math.max(2, Math.min(r.missionSol, r.sustainable ? 120 : r.missionSol));
    var lines = [
      { key: "o2", color: "#37c7b8" },
      { key: "water", color: "#5aa9ff" },
      { key: "food", color: "#f4b942" }
    ];
    var yMax = 1;
    lines.forEach(function (L) {
      for (var i = 0; i <= solMax && i < r.series[L.key].length; i++)
        yMax = Math.max(yMax, r.series[L.key][i]);
    });
    // axes
    ctx.strokeStyle = "#2e2a47"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, 8); ctx.lineTo(pad, H - pad); ctx.lineTo(W - 8, H - pad); ctx.stroke();
    ctx.fillStyle = "#837c9a"; ctx.font = "11px sans-serif";
    ctx.fillText("kg", 6, 16);
    ctx.fillText(solMax + " sols", W - 60, H - 12);
    lines.forEach(function (L) {
      ctx.strokeStyle = L.color; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i <= solMax && i < r.series[L.key].length; i++) {
        var x = pad + (i / solMax) * (W - pad - 12);
        var y = (H - pad) - (r.series[L.key][i] / yMax) * (H - pad - 12);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  // -------------------------------------------------------------------------
  // Saved runs (localStorage) + comparison
  function loadRuns() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveRuns(runs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }

  function saveCurrent(r) {
    var runs = loadRuns();
    var name = r.params.name || ("Run " + (runs.length + 1));
    runs.push({
      name: name,
      crew: r.params.crew, area: r.params.area, crop: r.params.crop,
      ars: Math.round(r.params.arsEff * 100), wrs: Math.round(r.params.wrsEff * 100),
      reserve: r.params.reserveDays,
      sustainable: r.sustainable, mission: r.sustainable ? "∞" : r.missionSol,
      esm: r.esm,
      o2net: +r.net.o2.toFixed(2), foodnet: +r.net.food.toFixed(2), waternet: +r.net.water.toFixed(2)
    });
    saveRuns(runs);
    renderRuns();
  }

  function renderRuns() {
    var runs = loadRuns();
    var wrap = document.getElementById("saved");
    if (!runs.length) { wrap.innerHTML = '<p class="muted">No saved runs yet. Configure a habitat above and hit <strong>Save run</strong> to start comparing models.</p>'; return; }
    var rows = runs.map(function (x, i) {
      return '<tr>' +
        '<td>' + escapeHtml(x.name) + '</td>' +
        '<td>' + x.crew + '</td><td>' + x.area + ' m²</td><td>' + (CROPS[x.crop] ? CROPS[x.crop].label.split(" ")[0] : x.crop) + '</td>' +
        '<td>' + x.ars + '/' + x.wrs + '%</td>' +
        '<td>' + (x.sustainable ? '<span class="pill done">yes</span>' : '<span class="pill wip">no</span>') + '</td>' +
        '<td>' + x.mission + '</td>' +
        '<td>' + fmt(x.esm) + '</td>' +
        '<td><button class="mini-x" data-i="' + i + '">✕</button></td>' +
      '</tr>';
    }).join("");
    wrap.innerHTML =
      '<div style="overflow-x:auto"><table class="bal saved-table"><thead><tr>' +
      '<th>Model</th><th>Crew</th><th>Crop area</th><th>Crop</th><th>ARS/WRS</th><th>Closed-loop</th><th>Mission (sols)</th><th>ESM (kg)</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<canvas id="cmpchart" width="640" height="220" class="cmp"></canvas>';
    wrap.querySelectorAll(".mini-x").forEach(function (b) {
      b.addEventListener("click", function () {
        var runs = loadRuns(); runs.splice(+b.getAttribute("data-i"), 1); saveRuns(runs); renderRuns();
      });
    });
    drawBars(document.getElementById("cmpchart"), runs);
  }

  // Comparison bar chart of ESM across saved runs (lower = better)
  function drawBars(canvas, runs) {
    if (!canvas || !runs.length) return;
    var ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height, pad = 30;
    ctx.clearRect(0, 0, W, H);
    var max = Math.max.apply(null, runs.map(function (r) { return r.esm; })) * 1.1 || 1;
    var bw = (W - pad - 10) / runs.length;
    ctx.fillStyle = "#837c9a"; ctx.font = "11px sans-serif";
    ctx.fillText("ESM (kg) — lower is better", pad, 14);
    runs.forEach(function (r, i) {
      var h = (r.esm / max) * (H - pad - 20);
      var x = pad + i * bw + 6, y = (H - pad) - h;
      ctx.fillStyle = r.sustainable ? "#37c7b8" : "#e2683c";
      ctx.fillRect(x, y, bw - 12, h);
      ctx.fillStyle = "#b7b0cc"; ctx.font = "10px sans-serif";
      ctx.save(); ctx.translate(x + (bw - 12) / 2, H - pad + 4); ctx.rotate(0.35);
      ctx.fillText((r.name || "").slice(0, 12), 0, 8); ctx.restore();
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  // -------------------------------------------------------------------------
  // Export
  function exportJSON() {
    download("astrobiosim-runs.json", "application/json", JSON.stringify(loadRuns(), null, 2));
  }
  function exportCSV() {
    var runs = loadRuns();
    var head = ["name", "crew", "area_m2", "crop", "ars_pct", "wrs_pct", "reserve_days", "sustainable", "mission_sols", "esm_kg", "o2_net", "food_net", "water_net"];
    var rows = runs.map(function (x) {
      return [x.name, x.crew, x.area, x.crop, x.ars, x.wrs, x.reserve, x.sustainable, x.mission, x.esm, x.o2net, x.foodnet, x.waternet]
        .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    });
    download("astrobiosim-runs.csv", "text/csv", [head.join(","), ].concat(rows).join("\n"));
  }
  function download(name, type, data) {
    var blob = new Blob([data], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------------
  var current = null;
  function run() {
    current = simulate(readInputs());
    renderResults(current);
    return current;
  }

  function bindSliders() {
    [["crew", ""], ["area", " m²"], ["ars", "%"], ["wrs", "%"], ["reserve", " sols"]].forEach(function (pair) {
      var id = pair[0], suffix = pair[1];
      var input = document.getElementById(id), out = document.getElementById(id + "-val");
      if (!input) return;
      var upd = function () { if (out) out.textContent = input.value + suffix; run(); };
      input.addEventListener("input", upd);
    });
    document.getElementById("crop").addEventListener("change", run);
  }

  function init() {
    if (!document.getElementById("biosim-app")) return;
    bindSliders();
    document.getElementById("save-run").addEventListener("click", function () { if (current) saveCurrent(current); });
    document.getElementById("export-csv").addEventListener("click", exportCSV);
    document.getElementById("export-json").addEventListener("click", exportJSON);
    document.getElementById("clear-runs").addEventListener("click", function () {
      if (confirm("Delete all saved runs?")) { saveRuns([]); renderRuns(); }
    });
    // seed the value labels
    ["crew", "area", "ars", "wrs", "reserve"].forEach(function (id) {
      var input = document.getElementById(id), out = document.getElementById(id + "-val");
      var suffix = { crew: "", area: " m²", ars: "%", wrs: "%", reserve: " sols" }[id];
      if (out) out.textContent = input.value + suffix;
    });
    run();
    renderRuns();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
