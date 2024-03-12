import { Schema } from "@effect/schema";

/* -------------------------------------------------------------------------------------------------
 * Node
 * -----------------------------------------------------------------------------------------------*/

export interface Node {
  readonly _kind: string;
  readonly value: string | ReadonlyArray<Node>;
}

export const Node: Schema.Schema<Node> = Schema.struct({
  _kind: Schema.string,
  value: Schema.union(Schema.string, Schema.array(Schema.suspend(() => Node))),
}).pipe(Schema.identifier("Node"));

/* -------------------------------------------------------------------------------------------------
 * Tokens
 * -----------------------------------------------------------------------------------------------*/

export const createToken = (pattern: RegExp, kind: string) =>
  Schema.string.pipe(Schema.pattern(pattern)).pipe(
    Schema.transform(
      Node,
      (image: string) => ({ _kind: kind, value: image }),
      (node: Node) => node.value + "",
    ),
  );

const Dot = createToken(/\./, "Dot");
const Comma = createToken(/,/, "Comma");
const OpenParen = createToken(/\(/, "OpenParen");
const CloseParen = createToken(/\)/, "CloseParen");
const Identifier = createToken(/^[a-zA-Z]\w*/, "Identifier");
const SemiColon = createToken(/;/, "SemiColon");

const SingleQuotedValue = Schema.string.pipe(
  Schema.pattern(/'[^']*'/),
  Schema.transform(
    Node,
    (image: string) => ({
      _kind: "SingleQuotedValue",
      value: image.slice(1, -1),
    }),
    (node: Node) => node.value + "",
  ),
);

const NumberValue = Schema.NumberFromString;

const Uuid = Schema.string.pipe(Schema.pattern(/uuid/i));
const Serial = Schema.string.pipe(Schema.pattern(/serial/i));
const Int = Schema.string.pipe(Schema.pattern(/integer|int/i));
const Bigint = Schema.string.pipe(Schema.pattern(/bigint/i));
const Text = Schema.string.pipe(Schema.pattern(/text/i));
const Date = Schema.string.pipe(Schema.pattern(/date/i));
const Bool = Schema.string.pipe(Schema.pattern(/boolean/i));
const Timestamp = Schema.string.pipe(Schema.pattern(/timestamp/i));

const DataTypeSchema = Schema.union(
  Uuid,
  Serial,
  Int,
  Bigint,
  Text,
  Date,
  Bool,
  Timestamp,
);

const DataType = DataTypeSchema.pipe(
  Schema.transform(
    Node,
    (image: string) => ({ _kind: "DataType", value: image }),
    (node: Node) => node.value + "",
  ),
);

/**
 * Keywords
 */
const Create = createToken(/Create/i, "Create");
const Default = createToken(/Default/i, "Default");
const Key = createToken(/Key/i, "Key");
const Not = createToken(/Not/i, "Not");
const Null = createToken(/Null/i, "Null");
const Primary = createToken(/Primary/i, "Primary");
const References = createToken(/References/i, "References");
const Table = createToken(/Table/i, "Table");
const Unique = createToken(/Unique/i, "Unique");

export {
  CloseParen,
  Comma,
  Create,
  DataType,
  Default,
  Dot,
  Identifier,
  Key,
  Not,
  Null,
  NumberValue,
  OpenParen,
  Primary,
  References,
  SemiColon,
  SingleQuotedValue,
  Table,
  Unique,
};
