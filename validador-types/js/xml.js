// Leitor de XML pequeno que guarda a linha de cada elemento.
// O DOMParser do navegador não informa linha, e sem linha o relatório não ajuda
// num types.xml de 40 mil linhas. Cobre o que aparece em arquivo de economia do DayZ:
// prólogo, comentários, CDATA, elementos, atributos e texto.

export class XmlError extends Error {
  constructor(message, line, column) {
    super(message);
    this.line = line;
    this.column = column;
  }
}

const NAME = /^[A-Za-z_:][\w:.\-]*$/;
const ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

export function parseXml(source) {
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;

  // posição de cada quebra de linha, pra achar a linha de um índice com busca binária
  const breaks = [];
  for (let i = text.indexOf("\n"); i !== -1; i = text.indexOf("\n", i + 1)) breaks.push(i);
  const lineOf = (index) => {
    let lo = 0;
    let hi = breaks.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (breaks[mid] < index) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1;
  };
  const columnOf = (index) => index - (text.lastIndexOf("\n", index - 1) + 1) + 1;
  const fail = (message, index) => {
    throw new XmlError(message, lineOf(index), columnOf(index));
  };

  const decode = (raw, start) =>
    raw.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);|&/g, (match, entity, offset) => {
      if (!entity) fail("& solto (use &amp;)", start + offset);
      if (entity[0] === "#") {
        const code = entity[1] === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return String.fromCodePoint(code);
      }
      if (!(entity in ENTITIES)) fail(`entidade desconhecida &${entity};`, start + offset);
      return ENTITIES[entity];
    });

  let root = null;
  const stack = [];
  let i = 0;

  const addText = (raw, start) => {
    if (stack.length) {
      stack[stack.length - 1].text += decode(raw, start);
    } else if (raw.trim()) {
      fail(root ? "conteúdo depois do elemento raiz" : "texto antes do elemento raiz", start + raw.search(/\S/));
    }
  };

  while (i < text.length) {
    const lt = text.indexOf("<", i);
    if (lt === -1) {
      addText(text.slice(i), i);
      break;
    }
    if (lt > i) addText(text.slice(i, lt), i);

    if (text.startsWith("<?", lt)) {
      const end = text.indexOf("?>", lt);
      if (end === -1) fail("<? sem ?>", lt);
      // achei isso num types de mod: dois arquivos colados, com outro <?xml no meio
      if (/^<\?xml[\s?]/i.test(text.slice(lt, lt + 6)) && lt !== 0)
        fail("declaração <?xml ...?> fora do começo do arquivo", lt);
      i = end + 2;
    } else if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      if (end === -1) fail("comentário sem -->", lt);
      // <!------ titulo ------> é comum em types de mod, mas o XML não aceita -- dentro de comentário
      const body = text.slice(lt + 4, end);
      const dashes = body.indexOf("--");
      if (dashes !== -1) fail("comentário com -- no meio (o XML não aceita)", lt + 4 + dashes);
      if (body.endsWith("-")) fail("comentário terminando em --->", end - 1);
      i = end + 3;
    } else if (text.startsWith("<![CDATA[", lt)) {
      const end = text.indexOf("]]>", lt);
      if (end === -1) fail("CDATA sem ]]>", lt);
      if (!stack.length) fail("CDATA fora do elemento raiz", lt);
      stack[stack.length - 1].text += text.slice(lt + 9, end);
      i = end + 3;
    } else if (text.startsWith("<!", lt)) {
      const end = text.indexOf(">", lt);
      if (end === -1) fail("<! sem >", lt);
      i = end + 1;
    } else if (text[lt + 1] === "/") {
      const end = text.indexOf(">", lt);
      if (end === -1) fail("tag de fechamento sem >", lt);
      const name = text.slice(lt + 2, end).trim();
      const open = stack.pop();
      if (!open) fail(`</${name}> sem tag aberta`, lt);
      if (open.tag !== name) fail(`</${name}> não fecha <${open.tag}> (aberta na linha ${open.line})`, lt);
      open.text = open.text.trim();
      i = end + 1;
    } else {
      i = readStartTag(lt);
    }
  }

  if (stack.length) {
    const open = stack[stack.length - 1];
    throw new XmlError(`<${open.tag}> aberta na linha ${open.line} não foi fechada`, lineOf(text.length), columnOf(text.length));
  }
  if (!root) throw new XmlError("arquivo vazio", 1, 1);
  return root;

  function readStartTag(lt) {
    let j = lt + 1;
    const nameEnd = text.slice(j).search(/[\s/>]/);
    if (nameEnd <= 0) fail("< sem nome de tag", lt);
    const tag = text.slice(j, j + nameEnd);
    if (!NAME.test(tag)) fail(`nome de tag inválido <${tag}>`, lt);
    j += nameEnd;

    const node = { tag, attrs: new Map(), line: lineOf(lt), children: [], text: "" };
    for (;;) {
      while (/\s/.test(text[j] || "")) j++;
      if (j >= text.length) fail(`<${tag}> sem >`, lt);
      if (text.startsWith("/>", j)) {
        attach(node, lt);
        return j + 2;
      }
      if (text[j] === ">") {
        attach(node, lt);
        stack.push(node);
        return j + 1;
      }
      const attrMatch = /^([^\s=/>"']+)\s*=\s*(["'])/.exec(text.slice(j, j + 200));
      if (!attrMatch) fail(`atributo mal escrito em <${tag}>`, j);
      const [whole, attr, quote] = attrMatch;
      if (!NAME.test(attr)) fail(`nome de atributo inválido: ${attr}`, j);
      const valueStart = j + whole.length;
      const valueEnd = text.indexOf(quote, valueStart);
      if (valueEnd === -1) fail(`valor de ${attr} sem aspas de fechamento`, j);
      const raw = text.slice(valueStart, valueEnd);
      if (raw.includes("<")) fail(`< dentro do valor de ${attr}`, valueStart + raw.indexOf("<"));
      if (node.attrs.has(attr)) fail(`atributo ${attr} repetido`, j);
      node.attrs.set(attr, decode(raw, valueStart));
      j = valueEnd + 1;
      if (!/[\s/>]/.test(text[j] || "")) fail(`falta espaço depois de ${attr}="..."`, j);
    }
  }

  function attach(node, index) {
    if (stack.length) {
      stack[stack.length - 1].children.push(node);
    } else if (root) {
      fail("mais de um elemento raiz", index);
    } else {
      root = node;
    }
  }
}
