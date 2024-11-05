export function isSpace(c: string): boolean {
	const uc = c.charCodeAt(0);

	if (uc <= 0x377) {
		return uc === 32 || uc - 0x9 <= 4 || uc === 0xa0;
	}

	return isControlCharacter(uc);
}

export function isControlCharacter(code: number): boolean {
	return (
		code === 9 || // \t (tab)
		code === 10 || // \n (newline / line feed)
		code === 13 || // \r (carriage return)
		code === 12 || // \f (form feed)
		code === 11 // \v (vertical tab)
	);
}

export function isAlpha(c: string): boolean {
	const uc = c.charCodeAt(0);
	return (uc >= 0x41 && uc <= 0x5a) || (uc >= 0x61 && uc <= 0x7a);
}

export function isUnderscore(c: string): boolean {
	const uc = c.charCodeAt(0);
	return uc === 95;
}

export function isDigit(c: string): boolean {
	const uc = c.charCodeAt(0);
	return uc >= 0x30 && uc <= 0x39;
}
