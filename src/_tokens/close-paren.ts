import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TCloseParen extends Token {
	kind: "TCloseParen";
}

export const TCloseParen = freeze({
	is(token: Token): token is TCloseParen {
		return token.kind === "TCloseParen";
	},
	create(): TCloseParen {
		return freeze({ kind: "TCloseParen" });
	},
});
