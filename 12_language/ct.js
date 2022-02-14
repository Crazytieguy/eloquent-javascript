const fs = require("fs");
const { evaluateMany } = require("./evaluator.js");
const { parseProgram } = require("./parser");

const fileName = process.argv[2];
if (!fileName) {
  throw new Error("Please pass a file name");
}

const program = fs.readFileSync(fileName, "utf8");
const parsedProgram = parseProgram(program);

const prelude = fs.readFileSync("prelude.ct", "utf8");
const context = {};
evaluateMany(parseProgram(prelude), context);
evaluateMany(parsedProgram, context);
