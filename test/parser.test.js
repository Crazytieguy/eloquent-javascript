const {
  parseProgram,
  parseList,
  parseNumber,
  parseString,
  parseSymbol,
  parseWhiteSpace,
  ParseError,
} = require("../parser.js");

test("parse whitespace", () => {
  expect(parseWhiteSpace(" ,\n  ,...")).toStrictEqual([
    { type: "whiteSpace" },
    "...",
  ]);
});

test("parse a symbol", () => {
  expect(parseSymbol("some1-sy.mbol,...")).toStrictEqual([
    { type: "symbol", value: "some1-sy.mbol" },
    ",...",
  ]);
});

test("parse a string", () => {
  expect(parseString('"Some string\n-"...')).toStrictEqual([
    { type: "literal", value: "Some string\n-" },
    "...",
  ]);
});

test("throw when parsing an invalid string", () => {
  expect(() => parseString('"...')).toThrow(ParseError);
});

test("parse a number", () => {
  expect(parseNumber("019092...")).toStrictEqual([
    { type: "literal", value: 19092 },
    "...",
  ]);
});

test("parse a list recursively", () => {
  expect(parseList('(a 1 (b "s"))...')).toStrictEqual([
    {
      type: "list",
      elements: [
        { type: "symbol", value: "a" },
        { type: "literal", value: 1 },
        {
          type: "list",
          elements: [
            { type: "symbol", value: "b" },
            { type: "literal", value: "s" },
          ],
        },
      ],
    },
    "...",
  ]);
});

test("disallow unmatched open paren", () => {
  expect(() => parseList("(... a 123")).toThrow(
    new ParseError("Unmatched opening paren")
  );
});

test("parse a program", () => {
  expect(
    parseProgram(`
  (sym-bol,1 "s")
  "a string"
  (> 2 (c d))
  `)
  ).toStrictEqual([
    {
      type: "list",
      elements: [
        { type: "symbol", value: "sym-bol" },
        { type: "literal", value: 1 },
        { type: "literal", value: "s" },
      ],
    },
    {
      type: "literal",
      value: "a string",
    },
    {
      type: "list",
      elements: [
        { type: "symbol", value: ">" },
        { type: "literal", value: 2 },
        {
          type: "list",
          elements: [
            { type: "symbol", value: "c" },
            { type: "symbol", value: "d" },
          ],
        },
      ],
    },
  ]);
});

test("disallow unmatched closed paren", () => {
  expect(() => parseProgram("... a 123)")).toThrow(
    new ParseError("Unmatched closed paren")
  );
});
