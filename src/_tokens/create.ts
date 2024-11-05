import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TCreate extends Token {
	kind: "TCreate";
}

export const TCreate = freeze({
	is(token: Token): token is TCreate {
		return token.kind === "TCreate";
	},
	create(): TCreate {
		return freeze({ kind: "TCreate" });
	},
});
