class ParseError extends Error {}

function parseProgram(code) {
  const elements = [];
  let remainingCode = code;
  let nextElement;
  while (remainingCode !== "") {
    [nextElement, remainingCode] = parseNext(remainingCode);
    if (nextElement.type !== "whiteSpace") {
      elements.push(nextElement);
    }
  }
  return elements;
}

function parseList(code) {
  const elements = [];
  let remainingCode = code.slice(1);
  let nextElement;
  while (remainingCode[0] !== ")") {
    if (remainingCode === "") {
      throw new ParseError("Unmatched opening paren");
    }
    [nextElement, remainingCode] = parseNext(remainingCode);
    if (nextElement.type !== "whiteSpace") {
      elements.push(nextElement);
    }
  }
  return [{ type: "list", elements }, remainingCode.slice(1)];
}

function parseNext(code) {
  let nextChar = code[0];
  if (nextChar === ")") {
    throw new ParseError("Unmatched closed paren");
  }
  if (nextChar === "(") {
    return parseList(code);
  }
  if (nextChar === '"') {
    return parseString(code);
  }
  if (whiteSpace.has(nextChar)) {
    return parseWhiteSpace(code);
  }
  if (numbers.has(nextChar)) {
    return parseNumber(code);
  }
  return parseSymbol(code);
}

const whiteSpace = new Set(" \n\r,");

function parseWhiteSpace(code) {
  let i = 1;
  while (code[i] && whiteSpace.has(code[i])) {
    i++;
  }
  return [{ type: "whiteSpace" }, code.slice(i)];
}

const numbers = new Set("0123456789");

function parseNumber(code) {
  let i = 1;
  while (code[i] && numbers.has(code[i])) {
    i++;
  }
  return [{ type: "literal", value: Number(code.slice(0, i)) }, code.slice(i)];
}

function parseString(code) {
  let i = 1;
  while (code[i] && code[i] !== '"') {
    i++;
  }
  if (!code[i]) {
    throw new ParseError("Unmatched double quote");
  }
  return [{ type: "literal", value: code.slice(1, i) }, code.slice(i + 1)];
}

const specialCharacters = new Set([...whiteSpace, ...'()"']);

function parseSymbol(code) {
  let i = 1;
  while (code[i] && !specialCharacters.has(code[i])) {
    i++;
  }
  return [{ type: "symbol", value: code.slice(0, i) }, code.slice(i)];
}

module.exports = {
  parseProgram,
  parseList,
  parseNumber,
  parseString,
  parseSymbol,
  parseWhiteSpace,
  ParseError,
};
