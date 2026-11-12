// Mesmas regras do validador em Python (github.com/edudiasr/Dayz-Types-Validator).
// O teste em teste/paridade.mjs roda os dois nos mesmos arquivos e compara.

import { parseXml, XmlError } from "./xml.js";

const NUMERIC_TAGS = ["nominal", "lifetime", "restock", "min", "quantmin", "quantmax", "cost"];
const SINGLE_TAGS = [...NUMERIC_TAGS, "flags", "category"];
const REPEATABLE_TAGS = ["usage", "value", "tag"];
const REQUIRED_TAGS = [...NUMERIC_TAGS, "flags"];
const FLAG_ATTRS = ["count_in_cargo", "count_in_hoarder", "count_in_map", "count_in_player", "crafted", "deloot"];

const SECTIONS = { categories: "category", tags: "tag", usageflags: "usage", valueflags: "value" };

export const ERROR = "erro";
export const WARNING = "aviso";

// ---------- cfglimitsdefinition ----------

export function emptyLimits() {
  return { names: {}, userNames: {} };
}

// Junta um cfglimitsdefinition.xml ou cfglimitsdefinitionuser.xml nos limites.
export function addLimits(limits, xmlText) {
  walk(parseXml(xmlText));
  return limits;

  function walk(node) {
    const kind = SECTIONS[node.tag];
    if (!kind) {
      node.children.forEach(walk);
      return;
    }
    for (const child of node.children) {
      const name = child.attrs.get("name");
      if (!name) continue;
      if (child.tag === kind) (limits.names[kind] ??= new Set()).add(name.toLowerCase());
      else if (child.tag === "user") (limits.userNames[kind] ??= new Set()).add(name.toLowerCase());
    }
  }
}

// Diz se o arquivo é de limites (pela tag raiz), pra separar quando o usuário solta tudo junto.
export function isLimitsFile(xmlText) {
  const match = /<\s*([A-Za-z_][\w.\-]*)[\s>/]/.exec(xmlText.replace(/<\?[\s\S]*?\?>|<!--[\s\S]*?-->/g, ""));
  return Boolean(match && (match[1] === "lists" || match[1] === "user_lists"));
}

// ---------- validação ----------

export function validate(xmlText, limits = null) {
  const report = { issues: [], typeCount: 0, spawningCount: 0, nominalByCategory: new Map() };
  const issue = (severity, code, message, line, type = null) =>
    report.issues.push({ severity, code, message, line, type });
  const error = (...args) => issue(ERROR, ...args);
  const warn = (...args) => issue(WARNING, ...args);

  let root;
  try {
    root = parseXml(xmlText);
  } catch (e) {
    if (!(e instanceof XmlError)) throw e;
    error("E001", `XML inválido: ${e.message} (coluna ${e.column})`, e.line);
    return finish();
  }

  if (root.tag !== "types") {
    error("E002", `a raiz do arquivo deve ser <types>, encontrado <${root.tag}>`, root.line);
    return finish();
  }

  const seen = new Map();
  for (const node of root.children) {
    if (node.tag !== "type") {
      warn("W008", `elemento <${node.tag}> fora de um <type> será ignorado pelo jogo`, node.line);
      continue;
    }
    report.typeCount++;
    const name = (node.attrs.get("name") || "").trim();
    if (!name) {
      error("E003", "<type> sem o atributo name", node.line);
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      error("E004", `tipo duplicado (primeira declaração na linha ${seen.get(key)}); o jogo usa só uma delas`, node.line, name);
    } else {
      seen.set(key, node.line);
    }
    checkType(node, name);
  }
  return finish();

  function finish() {
    report.issues.sort((a, b) => a.line - b.line || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
    return report;
  }

  function checkType(node, name) {
    const counts = new Map();
    for (const child of node.children) counts.set(child.tag, (counts.get(child.tag) || 0) + 1);
    const count = (tag) => counts.get(tag) || 0;

    for (const tag of SINGLE_TAGS)
      if (count(tag) > 1) error("E005", `<${tag}> declarado ${count(tag)} vezes`, node.line, name);
    for (const tag of REQUIRED_TAGS) if (count(tag) === 0) warn("W002", `<${tag}> ausente`, node.line, name);
    for (const child of node.children)
      if (!SINGLE_TAGS.includes(child.tag) && !REPEATABLE_TAGS.includes(child.tag))
        warn("W001", `tag desconhecida <${child.tag}>`, child.line, name);

    const values = checkNumbers(node, name);
    checkRanges(node, name, values);
    checkFlags(node, name);
    checkNamedChildren(node, name);

    const nominal = values.nominal ?? 0;
    if (nominal > 0) {
      report.spawningCount++;
      const category = node.children.find((c) => c.tag === "category");
      const label = category ? category.attrs.get("name") ?? "?" : "(sem categoria)";
      report.nominalByCategory.set(label, (report.nominalByCategory.get(label) || 0) + nominal);
      if (!["usage", "value", "category"].some((t) => count(t) > 0))
        warn("W003", "nominal > 0 sem <usage>, <value> ou <category>: o item pode não ter onde nascer", node.line, name);
    }
  }

  function first(node, tag) {
    return node.children.find((c) => c.tag === tag);
  }

  function checkNumbers(node, name) {
    const values = {};
    for (const tag of NUMERIC_TAGS) {
      const child = first(node, tag);
      if (!child) continue;
      // igual ao int() do Python: aceita sinal e _ entre dígitos
      if (/^[+-]?\d+(_\d+)*$/.test(child.text)) values[tag] = parseInt(child.text.replace(/_/g, ""), 10);
      else error("E006", `<${tag}> deve ser um número inteiro, encontrado '${child.text}'`, child.line, name);
    }
    return values;
  }

  function checkRanges(node, name, values) {
    const lineOf = (tag) => first(node, tag).line;

    for (const tag of ["nominal", "lifetime", "restock", "min", "cost"])
      if (tag in values && values[tag] < 0) error("E007", `<${tag}> não pode ser negativo (${values[tag]})`, lineOf(tag), name);

    // com nominal 0 o item não nasce, então o min não faz diferença
    if ("min" in values && (values.nominal ?? 0) > 0 && values.min > values.nominal)
      error("E008", `min (${values.min}) maior que nominal (${values.nominal})`, lineOf("min"), name);

    for (const tag of ["quantmin", "quantmax"]) {
      const v = values[tag];
      if (v !== undefined && v !== -1 && !(v >= 0 && v <= 100))
        error("E009", `<${tag}> deve ser -1 ou ficar entre 0 e 100 (${v})`, lineOf(tag), name);
    }

    const { quantmin: qmin, quantmax: qmax } = values;
    if (qmin !== undefined && qmax !== undefined) {
      if ((qmin === -1) !== (qmax === -1))
        warn("W004", "só um entre quantmin e quantmax é -1; use -1 nos dois ou em nenhum", lineOf("quantmin"), name);
      else if (qmin > qmax) error("E010", `quantmin (${qmin}) maior que quantmax (${qmax})`, lineOf("quantmin"), name);
    }
  }

  function checkFlags(node, name) {
    const flags = first(node, "flags");
    if (!flags) return;
    for (const [attr, value] of flags.attrs) {
      if (!FLAG_ATTRS.includes(attr)) warn("W006", `atributo desconhecido em <flags>: ${attr}`, flags.line, name);
      else if (value !== "0" && value !== "1") error("E011", `${attr} deve ser 0 ou 1, encontrado '${value}'`, flags.line, name);
    }
    const missing = FLAG_ATTRS.filter((a) => !flags.attrs.has(a));
    if (missing.length) warn("W007", `<flags> sem: ${missing.join(", ")}`, flags.line, name);
  }

  function checkNamedChildren(node, name) {
    for (const tag of ["category", ...REPEATABLE_TAGS]) {
      const seenRefs = new Set();
      const unknown = [];
      let known = 0;
      for (const child of node.children.filter((c) => c.tag === tag)) {
        const ref = child.attrs.get("name") || child.attrs.get("user");
        const isUser = !child.attrs.has("name") && child.attrs.has("user");
        if (!ref) {
          error("E012", `<${tag}> sem o atributo name`, child.line, name);
          continue;
        }
        const key = ref.toLowerCase();
        if (seenRefs.has(key)) warn("W005", `<${tag} name="${ref}"> repetido`, child.line, name);
        seenRefs.add(key);
        if (existsInLimits(tag, ref, isUser)) known++;
        else unknown.push({ ref, isUser, line: child.line });
      }
      for (const { ref, isUser, line } of unknown) {
        const attr = isUser ? "user" : "name";
        const file = isUser ? "cfglimitsdefinitionuser.xml" : "cfglimitsdefinition.xml";
        // usage e value podem ter vários: se sobrou algum que existe, o item ainda nasce por ele
        if ((tag === "usage" || tag === "value") && known > 0)
          warn("W009", `<${tag} ${attr}="${ref}"> não existe no ${file} e é ignorado`, line, name);
        else error("E013", `<${tag} ${attr}="${ref}"> não existe no ${file}`, line, name);
      }
    }
  }

  function existsInLimits(kind, ref, isUser) {
    if (!limits) return true;
    const set = isUser ? limits.userNames[kind] : limits.names[kind];
    return !set || set.size === 0 || set.has(ref.toLowerCase());
  }
}
