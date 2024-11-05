import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TQuotedIdentifier extends Token {
	kind: "TQuotedIdentifier";
	value: string;
}

export const TQuotedIdentifier = freeze({
	is(token: Token): token is TQuotedIdentifier {
		return token.kind === "TQuotedIdentifier";
	},
	create(value: string): TQuotedIdentifier {
		return freeze({ kind: "TQuotedIdentifier", value });
	},
});
