export function span(
	input: string,
	predicate: (char: string) => boolean,
): [string, string] {
	let i = 0;
	while (i < input.length && predicate(input[i])) {
		i++;
	}
	return [input.slice(0, i), input.slice(i)];
}
