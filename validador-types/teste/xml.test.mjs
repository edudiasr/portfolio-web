// node --test teste/xml.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseXml, XmlError } from "../js/xml.js";
import { addLimits, emptyLimits, isLimitsFile, validate } from "../js/validator.js";

const errorLine = (xml) => {
  try {
    parseXml(xml);
  } catch (e) {
    assert.ok(e instanceof XmlError);
    return e.line;
  }
  assert.fail("devia ter dado erro");
};

test("guarda a linha de cada elemento", () => {
  const root = parseXml('<?xml version="1.0"?>\n<types>\n  <type name="A">\n    <nominal>4</nominal>\n  </type>\n</types>');
  assert.equal(root.line, 2);
  assert.equal(root.children[0].line, 3);
  assert.equal(root.children[0].children[0].line, 4);
  assert.equal(root.children[0].children[0].text, "4");
});

test("atributos com aspas simples, entidades e auto-fechamento", () => {
  const root = parseXml(`<types><type name='Feijão &amp; Arroz'><flags a="1" b='0'/></type></types>`);
  const type = root.children[0];
  assert.equal(type.attrs.get("name"), "Feijão & Arroz");
  assert.deepEqual([...type.children[0].attrs], [["a", "1"], ["b", "0"]]);
});

test("comentários e CDATA", () => {
  const root = parseXml("<types><!-- comentário --><type><nominal><![CDATA[7]]></nominal></type></types>");
  assert.equal(root.children[0].children[0].text, "7");
});

test("erros apontam a linha certa", () => {
  assert.equal(errorLine("<types>\n<type>\n</types>"), 3); // fecha a tag errada
  assert.equal(errorLine("<types>\n<type name=\"A\">\n"), 3); // arquivo acaba sem fechar
  assert.equal(errorLine("<types>\n<!------ titulo ------>\n</types>"), 2); // -- dentro de comentário
  assert.equal(errorLine("<types>\n</types>\n<?xml version=\"1.0\"?>"), 3); // segundo <?xml
  assert.equal(errorLine("<types>\n<type name=\"A & B\"/>\n</types>"), 2); // & solto
  assert.equal(errorLine("<types>\n<type a=\"1\" a=\"2\"/>\n</types>"), 2); // atributo repetido
  assert.equal(errorLine("<types/>\n<types/>"), 2); // duas raízes
  assert.equal(errorLine(""), 1);
});

test("separa arquivo de limites de arquivo de types", () => {
  assert.ok(isLimitsFile('<?xml version="1.0"?>\n<!-- x -->\n<lists></lists>'));
  assert.ok(isLimitsFile("<user_lists/>"));
  assert.ok(!isLimitsFile("<types></types>"));
});

test("usage de mod ao lado de uma que existe vira aviso", () => {
  const limits = addLimits(emptyLimits(), "<lists><usageflags><usage name=\"Town\"/></usageflags></lists>");
  const xml = `<types><type name="A"><nominal>1</nominal><lifetime>1</lifetime><restock>0</restock><min>1</min>
    <quantmin>-1</quantmin><quantmax>-1</quantmax><cost>100</cost>
    <flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" crafted="0" deloot="0"/>
    <usage name="Town"/><usage name="City"/></type></types>`;
  assert.deepEqual(validate(xml, limits).issues.map((i) => i.code), ["W009"]);
  assert.deepEqual(validate(xml.replace('<usage name="Town"/>', ""), limits).issues.map((i) => i.code), ["E013"]);
});
