const { evaluate, EvaluatorError } = require("../evaluator.js");

test("evaluate a literal", () => {
  expect(evaluate({ type: "literal", value: 5 })).toBe(5);
});

test("evaluate an existing symbol", () => {
  expect(evaluate({ type: "symbol", value: "a" }, { a: 5 })).toBe(5);
});

test("evaluate a missing symbol", () => {
  expect(() => evaluate({ type: "symbol", value: "b" }, { a: 5 })).toThrow(
    EvaluatorError
  );
});
