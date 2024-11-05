import type { Token } from "./src/_tokens/token";
import { TCreate } from "./src/_tokens/create";
import { TIdentifier } from "./src/_tokens/identifier";
import { TQuotedIdentifier } from "./src/_tokens/quoted-identifier";
import { isAlpha, isDigit, isSpace, isUnderscore } from "./src/char";
import { span } from "./src/func";
import { TTable } from "./src/_tokens/table";
import { TOpenParen } from "./src/_tokens/open-paren";
import { TCloseParen } from "./src/_tokens/close-paren";
import { TComma } from "./src/_tokens/comma";

function lexer(input: string): Token[] {
	const c = input[0];
	const cs = input.slice(1);

	if (!c) {
		return [];
	}
	if (isSpace(c)) {
		return lexer(cs);
	}
	if (isAlpha(c) || isUnderscore(c)) {
		return lexIdentifier(c + cs);
	}
	if (c === "(") {
		return [TOpenParen.create(), ...lexer(cs)];
	}
	if (c === ")") {
		return [TCloseParen.create(), ...lexer(cs)];
	}
	if (c === '"') {
		return lexQuotedIdentifier(c + cs);
	}
	if (c === ",") {
		return [TComma.create(), ...lexer(cs)];
	}

	throw new Error(`Unexpected character: ${c}`);
}

function isIdentifier(c: string): boolean {
	return isAlpha(c) || isUnderscore(c) || isDigit(c);
}

function lexIdentifier(input: string): Token[] {
	const [c, cs] = span(input, (x) => isIdentifier(x));

	if (c.toUpperCase() === "CREATE") {
		return [TCreate.create(), ...lexer(cs)];
	}
	if (c.toUpperCase() === "TABLE") {
		return [TTable.create(), ...lexer(cs)];
	}

	return [TIdentifier.create(c), ...lexer(cs)];
}

function lexQuotedIdentifier(input: string): Token[] {
	const rest = input.slice(1);
	const [word, cs] = span(rest, isIdentifier);
	const _q2 = cs[0];
	if (_q2 !== '"') {
		throw new Error(`Expected closing quote, got ${_q2}`);
	}
	return [TQuotedIdentifier.create(word), ...lexer(cs.slice(1))];
}

function parseColumn([name, ...rest]: Token[]) {
	// name must be either identifier or quoted identifier
}

// column node should have identifier, data type

const result = lexer(`
	CREATE TABLE foo_bar123 (
		"col1" INTEGER NOT NULL,
		"col2" INTEGER,
		// "col3" character varying(255) NOT NULL
	`);

console.log(result);
