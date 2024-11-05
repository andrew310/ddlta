function isLetter(char: string) {
	let code = char.charCodeAt(0);
	return (
		(code >= 65 && code <= 90) || // 'A'-'Z'
		(code >= 97 && code <= 122)
	); // 'a'-'z'
}

function isNumber(char: string) {
	let code = char.charCodeAt(0);
	return code >= 48 && code <= 57; // '0'-'9'
}

function isUnderscore(char: string) {
	return char === "_";
}

function isWhitespace(char: string) {
	return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function isDoubleQuote(char: string) {
	return char === '"';
}

function isSingleQuote(char: string) {
	return char === "'";
}

function isComma(char: string) {
	return char === ",";
}

function isDot(char: string) {
	return char === ".";
}

function isLParen(char: string) {
	return char === "(";
}

function isRParen(char: string) {
	return char === ")";
}

function isSemicolon(char: string) {
	return char === ";";
}

export function tokenize(input: string) {
	const tokens = [];
	let current = 0;

	while (current < input.length) {
		let char = input[current];

		if (isWhitespace(char)) {
			current++;
			continue;
		}

		/**
		 * words, as far as sql is concerned, must start with a letter,
		 * but thereafter they can contain numbers and underscores too
		 */
		if (isLetter(char)) {
			let value = "";

			while (isLetter(char) || isNumber(char) || isUnderscore(char)) {
				value += char;
				char = input[++current];
			}

			tokens.push(value);
			continue;
		}

		if (
			isComma(char) ||
			isDot(char) ||
			isSingleQuote(char) ||
			isDoubleQuote(char) ||
			isLParen(char) ||
			isRParen(char) ||
			isSemicolon(char)
		) {
			tokens.push(char);
			current++;
			continue;
		}

		// console.error({ char });
		throw new TypeError(`I don't know what this character is: ${char}`);
	}

	return tokens;
}
