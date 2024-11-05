import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TComma extends Token {
	kind: "TComma";
}

export const TComma = freeze({
	is(token: Token): token is TComma {
		return token.kind === "TComma";
	},
	create(): TComma {
		return freeze({ kind: "TComma" });
	},
});
