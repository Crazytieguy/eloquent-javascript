class EvaluatorError extends Error {}

const builtIns = {
  let([symbol, value, ...rest], context) {
    if (rest.length) {
      throw new EvaluatorError(
        `let takes two arguments, recieved ${exprs.length}`
      );
    }
    if (symbol.type !== "symbol") {
      throw new EvaluatorError("First argument to let should be a symbol");
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
    return { argsList, body };
  },
  if([cond, then, els, ...rest], context) {
    if (els === undefined || rest.length) {
      throw new EvaluatorError("if takes three arguments");
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
    console.log(value);
    return value;
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

for (let op of ["+", "-", "*", "/", "=", "<", ">"]) {
  builtIns[op] = ([a, b, ...rest], context) => {
    if (b === undefined || rest.length) {
      throw new EvaluatorError(`${op} takes two arguments`);
    }
    return binaryOps[op](evaluate(a, context), evaluate(b, context));
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
    if (!func instanceof Object) {
      if (func instanceof String) {
        func = `"${func}"`;
      }
      throw new EvaluatorError(`${func} is not callable`);
    }
    const args = expr.elements.slice(1).map(evaluate);
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

module.exports = {
  evaluate,
  EvaluatorError,
  evaluateMany,
};
