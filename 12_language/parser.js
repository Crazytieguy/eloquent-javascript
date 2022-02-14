class ParseError extends Error {}

function parseProgram(code) {
  return parseWhile(code)[0];
}

function parseList(code) {
  const [elements, remainingCode] = parseWhile(
    code.slice(1),
    (c) => !c.startsWith(")")
  );
  if (!remainingCode) {
    throw new ParseError("Unmatched opening paren");
  }
  return [{ type: "list", elements }, remainingCode.slice(1)];
}

function parseWhile(code, pred = () => true) {
  const elements = [];
  let nextElement;
  while (code && pred(code)) {
    [nextElement, code] = parseExpr(code);
    if (nextElement.type !== "whiteSpace") {
      elements.push(nextElement);
    }
  }
  return [elements, code];
}

function parseExpr(code) {
  if (code.startsWith(")")) {
    throw new ParseError("Unmatched closed paren");
  }
  if (code.startsWith("(")) {
    return parseList(code);
  }
  for (let [pattern, type, valGetter] of [
    [/^[\s,]+/, "whiteSpace", () => null],
    [/^\d+/, "literal", (m) => Number(m[0])],
    [/^"([^"]*)"/, "literal", (m) => m[1]],
    [/^[^\s,"()]+/, "symbol", (m) => m[0]],
  ]) {
    let match = pattern.exec(code);
    if (match) {
      return [{ type, value: valGetter(match) }, code.slice(match[0].length)];
    }
  }
  if (code.startsWith('"')) {
    throw new ParseError("Unmatched double quote");
  }
  throw new ParseError("Parser bug - couldn't parse element");
}

if (typeof module !== "undefined") {
  module.exports = {
    parseExpr,
    parseProgram,
    ParseError,
  };
}
