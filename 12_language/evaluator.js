class EvaluatorError extends Error {}

let log = console.log; // This can be overriden in the browser

const builtIns = {
  assign([symbol, value, ...rest], context) {
    if (value === undefined || rest.length) {
      throw new EvaluatorError("assign takes exactly two arguments");
    }
    if (symbol.type !== "symbol") {
      throw new EvaluatorError("First argument to assign should be a symbol");
    }
    if (Object.hasOwn(builtIns, symbol.value)) {
      throw new EvaluatorError(`symbol ${symbol.value} is reserved`);
    }
    return (context[symbol.value] = evaluate(value, context));
  },
  fn([rawArgsList, ...body], _context) {
    if (rawArgsList?.type !== "list") {
      throw new EvaluatorError(
        "First argument to fn should be a list of symbols"
      );
    }
    if (!body.length) {
      throw new EvaluatorError(
        "fn body should include at least one expression"
      );
    }
    const argsList = rawArgsList.elements.map(({ type, value }) => {
      if (type !== "symbol") {
        throw new EvaluatorError(
          "First argument to fn should be a list of symbols"
        );
      }
      return value;
    });
    return { type: "function", argsList, body };
  },
  if([cond, then, els, ...rest], context) {
    if (els === undefined || rest.length) {
      throw new EvaluatorError("if takes exactly three arguments");
    }
    if (evaluate(cond, context)) {
      return evaluate(then, context);
    }
    return evaluate(els, context);
  },
  while([cond, ...body], context) {
    if (!body.length) {
      throw new EvaluatorError("while takes a condition and a body");
    }
    let last;
    while (evaluate(cond, context)) {
      last = evaluateMany(body, context);
    }
    return last;
  },
  print([expr, ...rest], context) {
    if (expr === undefined || rest.length) {
      throw new EvaluatorError("print takes one argument");
    }
    const value = evaluate(expr, context);
    log(value);
    return value;
  },
  array(elements, context) {
    return {
      type: "array",
      elements: elements.map((e) => evaluate(e, context)),
    };
  },
  length([arrayExpr, ...rest], context) {
    if (arrayExpr === undefined || rest.length) {
      throw new EvaluatorError("length takes exactly one argument");
    }
    const array = evaluate(arrayExpr, context);
    if (!array instanceof Object || array.type !== "array") {
      throw new EvaluatorError("The only argument to length must be an array");
    }
    return array.elements.length;
  },
  get([arrayExpr, idxExpr, ...rest], context) {
    if (idxExpr === undefined || rest.length) {
      throw new EvaluatorError("get takes exactly two arguments");
    }
    const array = evaluate(arrayExpr, context);
    if (!array instanceof Object || array.type !== "array") {
      throw new EvaluatorError("First argument to get should be an array");
    }
    const idx = evaluate(idxExpr, context);
    if (!idx instanceof Number) {
      throw new EvaluatorError("Second argument to get should be a number");
    }
    if (idx >= array.elements.length) {
      throw new Error("idx out of bounds");
    }
    return array.elements[idx];
  },
  push([arrayExpr, elemExpr, ...rest], context) {
    if (elemExpr === undefined || rest.length) {
      throw new EvaluatorError("push takes exactly two arguments");
    }
    const array = evaluate(arrayExpr, context);
    if (!array instanceof Object || array.type !== "array") {
      throw new EvaluatorError("First argument to push should be an array");
    }
    const elem = evaluate(elemExpr, context);
    array.elements.push(elem);
    return array;
  },
};

const binaryOps = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "=": (a, b) => a === b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
};

for (let [op, callBack] of Object.entries(binaryOps)) {
  builtIns[op] = ([a, b, ...rest], context) => {
    if (b === undefined || rest.length) {
      throw new EvaluatorError(`${op} takes two arguments`);
    }
    return callBack(evaluate(a, context), evaluate(b, context));
  };
}

function evaluateMany(exprs, context) {
  let last;
  for (let expr of exprs) {
    last = evaluate(expr, context);
  }
  return last;
}

function evaluate(expr, context) {
  if (expr.type === "literal") return expr.value;
  if (expr.type === "symbol") {
    if (Object.hasOwn(context, expr.value)) return context[expr.value];
    throw new EvaluatorError(`${expr.value} is not defined`);
  }
  if (expr.type === "list") {
    if (!expr.elements.length) {
      throw new EvaluatorError("Can't evaluate an empty list");
    }
    if (
      expr.elements[0].type === "symbol" &&
      Object.hasOwn(builtIns, expr.elements[0].value)
    ) {
      return builtIns[expr.elements[0].value](expr.elements.slice(1), context);
    }
    const func = evaluate(expr.elements[0], context);
    if (!func instanceof Object || func.type !== "function") {
      if (func instanceof String) {
        func = `"${func}"`;
      }
      throw new EvaluatorError(`${func} is not callable`);
    }
    const args = expr.elements.slice(1).map((e) => evaluate(e, context));
    if (args.length !== func.argsList.length) {
      throw new EvaluatorError(
        `${expr.elements[0].value} was called with a wrong number of arguments`
      );
    }
    return evaluateMany(func.body, {
      ...context,
      ...Object.fromEntries(
        func.argsList.map((symbol, i) => [symbol, args[i]])
      ),
    });
  }
  throw new EvaluatorError(`Language bug - invalid expression ${expr}`);
}

if (typeof module !== "undefined") {
  module.exports = {
    evaluate,
    EvaluatorError,
    evaluateMany,
  };
}
