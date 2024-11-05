import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TOpenParen extends Token {
	kind: "TOpenParen";
}

export const TOpenParen = freeze({
	is(token: Token): token is TOpenParen {
		return token.kind === "TOpenParen";
	},
	create(): TOpenParen {
		return freeze({ kind: "TOpenParen" });
	},
});
