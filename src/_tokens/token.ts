type TokenKind =
	| "TCreate"
	| "TComma"
	| "TTable"
	| "TIdentifier"
	| "TQuotedIdentifier"
	| "TOpenParen"
	| "TCloseParen";

export interface Token {
	kind: TokenKind;
}
