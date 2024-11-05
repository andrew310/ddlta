import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TTable extends Token {
	kind: "TTable";
}

export const TTable = freeze({
	is(token: Token): token is TTable {
		return token.kind === "TTable";
	},
	create(): TTable {
		return freeze({ kind: "TTable" });
	},
});
