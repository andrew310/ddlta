import { createToken, Lexer, type TokenType } from "chevrotain";

const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ });
const Lparen = createToken({ name: "Lparen", pattern: /\(/ });
const Rparen = createToken({ name: "Rparen", pattern: /\)/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });

const Function = createToken({
  name: "Function",
  pattern: Lexer.NA,
});

const Now = createToken({
  name: "Now",
  pattern: /NOW/i,
  categories: Function,
});

const UuidGenerateV4 = createToken({
  name: "UuidGenerateV4",
  pattern: /UUID_GENERATE_V4/i,
  categories: Function,
});

const Constraint = createToken({
  name: "Constraint",
  pattern: Lexer.NA,
});

const Null = createToken({
  name: "Null",
  pattern: /NULL/i,
  categories: Constraint,
});

const NotNull = createToken({
  name: "NotNull",
  pattern: /NOT NULL/i,
  categories: Constraint,
});

const PrimaryKey = createToken({
  name: "PrimaryKey",
  pattern: /PRIMARY KEY/i,
  categories: Constraint,
});

// constraint keywords that require a subrule
const Default = createToken({
  name: "Default",
  pattern: /DEFAULT/i,
});

const References = createToken({
  name: "References",
  pattern: /REFERENCES/i,
});

const ColumnType = createToken({
  name: "ColumnType",
  pattern: Lexer.NA,
});

const Serial = createToken({
  name: "Serial",
  pattern: /SERIAL/i,
  categories: ColumnType,
});

const Int = createToken({
  name: "Int",
  pattern: /INTEGER|INT/i,
  categories: ColumnType,
});

/**
 * @note sometimes unique can take parameters
 * @todo: move this to a subrule
 */
const Unique = createToken({
  name: "Unique",
  pattern: /UNIQUE/i,
  categories: ColumnType,
});

const Bigint = createToken({
  name: "Bigint",
  pattern: /BIGINT/i,
  categories: ColumnType,
});

const Date = createToken({
  name: "Date",
  pattern: /DATE/i,
  categories: ColumnType,
});

const Timestamp = createToken({
  name: "Timestamp",
  pattern: /TIMESTAMP/i,
  categories: ColumnType,
});

const Boolean = createToken({
  name: "Boolean",
  pattern: /BOOLEAN/i,
  categories: ColumnType,
});

const Uuid = createToken({
  name: "Uuid",
  pattern: /UUID/i,
  categories: ColumnType,
});

const Text = createToken({
  name: "Text",
  pattern: /TEXT/i,
  categories: ColumnType,
});

const Dot = createToken({
  name: "Dot",
  pattern: /\./,
});

const CreateTable = createToken({
  name: "CreateTable",
  pattern: /CREATE TABLE/i,
});
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});
const SemiColon = createToken({ name: "SemiColon", pattern: /;/ });

export {
  Bigint,
  Boolean,
  ColumnType,
  Comma,
  Constraint,
  CreateTable,
  Date,
  Default,
  Dot,
  Function,
  Identifier,
  Int,
  Lparen,
  NotNull,
  Now,
  Null,
  PrimaryKey,
  References,
  Rparen,
  SemiColon,
  Serial,
  Text,
  Timestamp,
  Unique,
  Uuid,
  UuidGenerateV4,
  WhiteSpace,
};
