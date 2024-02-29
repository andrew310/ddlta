import { CreateTableLexer } from "./src/lex";
import { CreateTableParser } from "./src/parse";
import { createEvalVisitor } from "./src/visit";

const inputText = "create table public.my_table (id uuid references foo)";

// const lexResult = CreateTableLexer.tokenize(inputText);

// console.log(lexResult);

const parser = new CreateTableParser();
const lexResult = CreateTableLexer.tokenize(inputText);
parser.input = lexResult.tokens;
const cst = parser.createTable();

const visitor = createEvalVisitor(parser, {});

const foo = visitor.visit(cst);

console.log(foo);
