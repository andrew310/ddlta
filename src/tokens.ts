import { Schema } from "@effect/schema";

/* -------------------------------------------------------------------------------------------------
 * Node
 * -----------------------------------------------------------------------------------------------*/

export interface Node {
	readonly _kind: string;
	readonly value: string | ReadonlyArray<Node>;
}

export const Node: Schema.Schema<Node> = Schema.Struct({
	_kind: Schema.String,
	value: Schema.Union(Schema.String, Schema.Array(Schema.suspend(() => Node))),
});

/* -------------------------------------------------------------------------------------------------
 * Tokens
 * -----------------------------------------------------------------------------------------------*/

export const createToken = (pattern: RegExp, kind: string) =>
	Schema.String.pipe(Schema.pattern(pattern)).pipe(
		Schema.transform(Node, {
			decode: (image: string) => ({ _kind: kind, value: image }),
			encode: (node: Node) => node.value as string,
		}),
	);

const Dot = createToken(/\./, "Dot");
const Comma = createToken(/,/, "Comma");
const OpenParen = createToken(/\(/, "OpenParen");
const CloseParen = createToken(/\)/, "CloseParen");
const Identifier = createToken(/^[a-zA-Z]\w*/, "Identifier");
const SemiColon = createToken(/;/, "SemiColon");

const SingleQuotedValue = Schema.String.pipe(
	Schema.pattern(/'[^']*'/),
	Schema.transform(Node, {
		decode: (image: string) => ({ _kind: "SingleQuotedValue", value: image }),
		encode: (node: Node) => node.value as string,
	}),
);

const NumberValue = Schema.NumberFromString;

const Uuid = Schema.String.pipe(Schema.pattern(/uuid/i));
const Serial = Schema.String.pipe(Schema.pattern(/serial/i));
const Int = Schema.String.pipe(Schema.pattern(/integer|int/i));
const Bigint = Schema.String.pipe(Schema.pattern(/bigint/i));
const Text = Schema.String.pipe(Schema.pattern(/text/i));
const Date_ = Schema.String.pipe(Schema.pattern(/date/i));
const Bool = Schema.String.pipe(Schema.pattern(/boolean/i));
const Timestamp = Schema.String.pipe(Schema.pattern(/timestamp/i));

const DataTypeSchema = Schema.Union(
	Uuid,
	Serial,
	Int,
	Bigint,
	Text,
	Date_,
	Bool,
	Timestamp,
);

const DataType = DataTypeSchema.pipe(
	Schema.transform(Node, {
		encode: (node: Node) => node.value as string,
		decode: (image: string) => ({ _kind: "DataType", value: image }),
	}),
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
