import type { Token } from "./token";
import { freeze } from "../object-utils";

export interface TIdentifier extends Token {
	kind: "TIdentifier";
	value: string;
}

export const TIdentifier = freeze({
	is(token: Token): token is TIdentifier {
		return token.kind === "TIdentifier";
	},
	create(value: string): TIdentifier {
		return freeze({ kind: "TIdentifier", value });
	},
});
