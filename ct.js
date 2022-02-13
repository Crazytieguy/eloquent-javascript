const fs = require("fs");
const { evaluateMany } = require("./evaluator.js");
const { parseProgram } = require("./parser");

const program = fs.readFileSync("example.ct", "utf8");
const parsedProgram = parseProgram(program);

const prelude = fs.readFileSync("prelude.ct", "utf8");
const context = {};
evaluateMany(parseProgram(prelude), context);
evaluateMany(parsedProgram, context);
