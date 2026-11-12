import { addLimits, emptyLimits, isLimitsFile, validate, ERROR, WARNING } from "./validator.js";
import { XmlError } from "./xml.js";

const PAGE = 300; // linhas da lista renderizadas por vez (o types do meu servidor dá 1400+ avisos)

const $ = (id) => document.getElementById(id);
const els = {
  drop: $("drop"),
  input: $("fileInput"),
  pick: $("pickBtn"),
  example: $("exampleBtn"),
  files: $("fileList"),
  notice: $("notice"),
  results: $("results"),
  tabs: $("tabs"),
  summary: $("summary"),
  verdict: $("verdict"),
  search: $("search"),
  exportBtn: $("exportBtn"),
  count: $("issueCount"),
  list: $("issueList"),
  more: $("moreBtn"),
  preview: $("preview"),
  cats: $("cats"),
  catBars: $("catBars"),
};

const state = {
  files: [], // { name, text, kind: "types" | "limits" }
  reports: new Map(), // nome -> relatório
  active: null, // nome do types mostrado
  filter: "all",
  query: "",
  shown: PAGE,
  selected: null,
  linesCache: new Map(),
};

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = (n) => n.toLocaleString("pt-BR");

/* ---------- entrada de arquivos ---------- */

els.pick.addEventListener("click", () => els.input.click());
els.input.addEventListener("change", () => {
  addFiles([...els.input.files]);
  els.input.value = "";
});
els.drop.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    els.input.click();
  }
});

// dá pra soltar em qualquer lugar da página, não só na caixa
let dragDepth = 0;
window.addEventListener("dragenter", (e) => {
  if (![...e.dataTransfer.types].includes("Files")) return;
  e.preventDefault();
  dragDepth++;
  els.drop.classList.add("is-over");
});
window.addEventListener("dragleave", () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) els.drop.classList.remove("is-over");
});
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault();
  dragDepth = 0;
  els.drop.classList.remove("is-over");
  addFiles([...e.dataTransfer.files]);
});

els.example.addEventListener("click", async () => {
  els.example.disabled = true;
  try {
    const names = ["types_com_erros.xml", "cfglimitsdefinition.xml"];
    const texts = await Promise.all(
      names.map((n) => fetch(`./exemplos/${n}`).then((r) => {
        if (!r.ok) throw new Error(`${n}: ${r.status}`);
        return r.text();
      }))
    );
    names.forEach((name, i) => upsert(name, texts[i]));
    showNotice("");
    run(names[0]);
  } catch (err) {
    showNotice(`Não consegui carregar o exemplo (${err.message}).`);
  } finally {
    els.example.disabled = false;
  }
});

async function addFiles(fileList) {
  const xmls = fileList.filter((f) => /\.xml$/i.test(f.name));
  const skipped = fileList.length - xmls.length;
  if (!xmls.length) {
    showNotice(skipped ? "Só arquivos .xml." : "");
    return;
  }
  let firstTypes = null;
  for (const file of xmls) {
    const text = await file.text();
    const kind = upsert(file.name, text);
    if (kind === "types" && !firstTypes) firstTypes = file.name;
  }
  showNotice(skipped ? `${skipped} arquivo(s) ignorado(s): só .xml.` : "");
  run(firstTypes);
}

function upsert(name, text) {
  const kind = isLimitsFile(text) ? "limits" : "types";
  const existing = state.files.findIndex((f) => f.name === name);
  const entry = { name, text, kind };
  if (existing >= 0) state.files[existing] = entry;
  else state.files.push(entry);
  state.linesCache.delete(name);
  return kind;
}

function removeFile(name) {
  state.files = state.files.filter((f) => f.name !== name);
  state.linesCache.delete(name);
  run(state.active === name ? null : state.active);
}

function showNotice(text) {
  els.notice.textContent = text;
  els.notice.hidden = !text;
}

/* ---------- validação ---------- */

function run(preferred) {
  let limits = null;
  const limitFiles = state.files.filter((f) => f.kind === "limits");
  const broken = [];
  if (limitFiles.length) {
    limits = emptyLimits();
    for (const f of limitFiles) {
      try {
        addLimits(limits, f.text);
      } catch (e) {
        if (!(e instanceof XmlError)) throw e;
        broken.push(`${f.name} (linha ${e.line}: ${e.message})`);
      }
    }
  }
  if (broken.length) showNotice(`Arquivo de limites com XML quebrado, ignorei: ${broken.join("; ")}`);

  state.reports.clear();
  for (const f of state.files.filter((f) => f.kind === "types")) state.reports.set(f.name, validate(f.text, limits));

  const names = [...state.reports.keys()];
  state.active = names.includes(preferred) ? preferred : names.includes(state.active) ? state.active : names[0] ?? null;
  state.shown = PAGE;
  state.selected = null;
  renderFiles();
  render();
}

/* ---------- tela ---------- */

function renderFiles() {
  els.files.innerHTML = state.files
    .map(
      (f) => `<li><span title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
        <small>${f.kind === "limits" ? "limites" : "types"}</small>
        <button type="button" data-remove="${escapeHtml(f.name)}" aria-label="Tirar ${escapeHtml(f.name)}">×</button></li>`
    )
    .join("");
}

els.files.addEventListener("click", (e) => {
  const name = e.target.closest("[data-remove]")?.dataset.remove;
  if (name) removeFile(name);
});

function render() {
  const report = state.reports.get(state.active);
  els.results.hidden = !report;
  if (!report) {
    if (state.files.length) showNotice("Faltou o types.xml: só tem arquivo de limites carregado.");
    return;
  }

  renderTabs();
  const errors = report.issues.filter((i) => i.severity === ERROR).length;
  const warnings = report.issues.length - errors;
  els.summary.innerHTML = [
    [fmt(report.typeCount), "tipos"],
    [fmt(report.spawningCount), "com nominal > 0"],
    [fmt(errors), errors === 1 ? "erro" : "erros", "stat--err"],
    [fmt(warnings), warnings === 1 ? "aviso" : "avisos", "stat--warn"],
  ]
    .map(([n, label, cls = ""]) => `<div class="stat ${cls}"><strong>${n}</strong><span>${label}</span></div>`)
    .join("");

  const hasLimits = state.files.some((f) => f.kind === "limits");
  els.verdict.className = `verdict ${errors ? "is-bad" : "is-ok"}`;
  els.verdict.textContent = errors
    ? `${fmt(errors)} ${errors === 1 ? "erro" : "erros"} pra corrigir antes do restart.`
    : `Nenhum erro${warnings ? `, só ${fmt(warnings)} ${warnings === 1 ? "aviso" : "avisos"}` : ""}. Pode reiniciar.` +
      (hasLimits ? "" : " (Sem o cfglimitsdefinition.xml os nomes de usage/value não foram conferidos.)");

  renderList();
  renderCategories(report);
  renderPreview();
}

function renderTabs() {
  const names = [...state.reports.keys()];
  if (names.length < 2) {
    els.tabs.innerHTML = "";
    return;
  }
  els.tabs.innerHTML = names
    .map((name) => {
      const errors = state.reports.get(name).issues.filter((i) => i.severity === ERROR).length;
      const badge = errors ? `<b class="err">${fmt(errors)}</b>` : `<b class="ok">✓</b>`;
      return `<button type="button" class="tab" role="tab" data-tab="${escapeHtml(name)}" aria-selected="${name === state.active}">${escapeHtml(name)}${badge}</button>`;
    })
    .join("");
}

els.tabs.addEventListener("click", (e) => {
  const name = e.target.closest("[data-tab]")?.dataset.tab;
  if (!name || name === state.active) return;
  state.active = name;
  state.shown = PAGE;
  state.selected = null;
  render();
});

function filteredIssues() {
  const report = state.reports.get(state.active);
  const q = state.query.trim().toLowerCase();
  const out = [];
  report.issues.forEach((issue, index) => {
    if (state.filter !== "all" && issue.severity !== state.filter) return;
    if (q && !issue.code.toLowerCase().includes(q) && !(issue.type || "").toLowerCase().includes(q) && !issue.message.toLowerCase().includes(q))
      return;
    out.push({ issue, index });
  });
  return out;
}

function renderList() {
  const issues = filteredIssues();
  const total = state.reports.get(state.active).issues.length;
  els.count.textContent = total
    ? issues.length === total
      ? `${fmt(total)} ${total === 1 ? "problema" : "problemas"}`
      : `${fmt(issues.length)} de ${fmt(total)}`
    : "Nada encontrado.";

  els.list.innerHTML = issues
    .slice(0, state.shown)
    .map(({ issue, index }) => {
      return `<li><button type="button" class="issue issue--${issue.severity}${index === state.selected ? " is-selected" : ""}" data-issue="${index}">
        <span class="issue__line">linha ${issue.line}</span>
        <span class="issue__code">${issue.code}</span>
        <span class="issue__text">${issue.type ? `<span class="issue__type">${escapeHtml(issue.type)}</span>` : ""}${escapeHtml(issue.message)}</span>
      </button></li>`;
    })
    .join("");

  const rest = issues.length - state.shown;
  els.more.hidden = rest <= 0;
  els.more.textContent = `Mostrar mais ${fmt(Math.min(rest, PAGE))}`;
}

els.more.addEventListener("click", () => {
  state.shown += PAGE;
  renderList();
});

els.list.addEventListener("click", (e) => {
  const button = e.target.closest("[data-issue]");
  if (!button) return;
  state.selected = Number(button.dataset.issue);
  els.list.querySelectorAll(".issue.is-selected").forEach((b) => b.classList.remove("is-selected"));
  button.classList.add("is-selected");
  renderPreview();
  if (window.matchMedia("(max-width: 899px)").matches) els.preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.querySelector(".chips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-filter]");
  if (!chip) return;
  state.filter = chip.dataset.filter;
  state.shown = PAGE;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-on", c === chip));
  renderList();
});

els.search.addEventListener("input", () => {
  state.query = els.search.value;
  state.shown = PAGE;
  renderList();
});

function linesOf(name) {
  if (!state.linesCache.has(name)) {
    const file = state.files.find((f) => f.name === name);
    state.linesCache.set(name, file ? file.text.replace(/^﻿/, "").split(/\r?\n/) : []);
  }
  return state.linesCache.get(name);
}

function renderPreview() {
  const issue = state.reports.get(state.active)?.issues[state.selected];
  if (!issue) {
    els.preview.innerHTML = `<p class="preview__empty">Clique num problema pra ver o trecho do arquivo.</p>`;
    return;
  }
  const lines = linesOf(state.active);
  const from = Math.max(1, issue.line - 5);
  const to = Math.min(lines.length, issue.line + 5);
  const warnClass = issue.severity === WARNING ? " is-warn" : "";
  let code = "";
  for (let n = from; n <= to; n++) {
    const hit = n === issue.line ? ` is-hit${warnClass}` : "";
    code += `<span class="ln${hit}"><i>${n}</i>${escapeHtml(lines[n - 1].replace(/\t/g, "    "))}</span>`;
  }
  els.preview.innerHTML = `
    <div class="preview__head">${escapeHtml(state.active)} · linha ${issue.line}</div>
    <pre>${code}</pre>
    <p class="preview__msg"><b>${issue.code}</b> ${escapeHtml(issue.message)}</p>`;
}

function renderCategories(report) {
  const rows = [...report.nominalByCategory].sort((a, b) => b[1] - a[1]);
  els.cats.hidden = rows.length === 0;
  const max = rows[0]?.[1] || 1;
  els.catBars.innerHTML = rows
    .map(
      ([name, total]) => `<div class="bar">
        <span class="bar__name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
        <span class="bar__track"><span class="bar__fill" style="width:${((total / max) * 100).toFixed(1)}%"></span></span>
        <span class="bar__n">${fmt(total)}</span></div>`
    )
    .join("");
}

/* ---------- exportar ---------- */

els.exportBtn.addEventListener("click", () => {
  const payload = [...state.reports].map(([file, r]) => ({
    file,
    types: r.typeCount,
    spawning: r.spawningCount,
    errors: r.issues.filter((i) => i.severity === ERROR).length,
    warnings: r.issues.filter((i) => i.severity === WARNING).length,
    nominal_by_category: Object.fromEntries(r.nominalByCategory),
    issues: r.issues,
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "types-validator.json",
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});
