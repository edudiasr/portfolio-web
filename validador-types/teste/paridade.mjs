// Roda o validador em Python e a versão em JS nos mesmos arquivos e compara o resultado.
//
//   node teste/paridade.mjs <pasta do Dayz-Types-Validator> [-l limites.xml ...] types.xml ...
//
// Sem arquivos, usa os exemplos da pasta ../exemplos.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { addLimits, emptyLimits, validate } from "../js/validator.js";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pythonRepo = args.shift();
if (!pythonRepo) {
  console.error("uso: node teste/paridade.mjs <pasta do Dayz-Types-Validator> [-l limites.xml] types.xml ...");
  process.exit(2);
}

const limitFiles = [];
const typeFiles = [];
while (args.length) {
  const arg = args.shift();
  if (arg === "-l") limitFiles.push(resolve(args.shift()));
  else typeFiles.push(resolve(arg));
}
if (!typeFiles.length) {
  const ex = join(here, "..", "exemplos");
  typeFiles.push(join(ex, "types_com_erros.xml"), join(ex, "types_ok.xml"), join(ex, "casos_extras.xml"));
  limitFiles.push(join(ex, "cfglimitsdefinition.xml"));
}

const limits = limitFiles.length ? emptyLimits() : null;
for (const file of limitFiles) addLimits(limits, readFileSync(file, "utf8"));

const pyArgs = ["-m", "types_validator", ...limitFiles.flatMap((f) => ["-l", f]), "-f", "json", ...typeFiles];
let pyOut;
try {
  pyOut = execFileSync("python", pyArgs, { cwd: pythonRepo, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
} catch (e) {
  pyOut = e.stdout; // sai com 1 quando acha erro, o que é normal
}
const pyReports = JSON.parse(pyOut);

let failures = 0;
typeFiles.forEach((file, index) => {
  const py = pyReports[index];
  const started = performance.now();
  const js = validate(readFileSync(file, "utf8"), limits);
  const ms = (performance.now() - started).toFixed(0);

  const key = (i) => `${i.line}|${i.code}|${i.type ?? ""}`;
  const pyKeys = py.issues.map(key);
  const jsKeys = js.issues.map(key);
  const onlyPy = pyKeys.filter((k) => !jsKeys.includes(k));
  const onlyJs = jsKeys.filter((k) => !pyKeys.includes(k));
  const cats = (obj) => JSON.stringify(Object.entries(obj).sort());

  const problems = [];
  if (pyKeys.length !== jsKeys.length) problems.push(`quantidade: python ${pyKeys.length}, js ${jsKeys.length}`);
  if (onlyPy.length) problems.push(`só no python: ${onlyPy.slice(0, 5).join(", ")}`);
  if (onlyJs.length) problems.push(`só no js: ${onlyJs.slice(0, 5).join(", ")}`);
  if (py.types !== js.typeCount) problems.push(`tipos: ${py.types} x ${js.typeCount}`);
  if (py.spawning !== js.spawningCount) problems.push(`nominal>0: ${py.spawning} x ${js.spawningCount}`);
  if (cats(py.nominal_by_category) !== cats(Object.fromEntries(js.nominalByCategory)))
    problems.push("nominal por categoria diferente");

  const name = file.split(/[\\/]/).pop();
  if (problems.length) {
    failures++;
    console.log(`FALHOU  ${name}\n  ${problems.join("\n  ")}`);
  } else {
    console.log(`ok      ${name}  (${js.issues.length} problemas, ${js.typeCount} tipos, js em ${ms} ms)`);
  }
});

process.exit(failures ? 1 : 0);
