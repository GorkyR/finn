export function enum_values(_enum: { [key: string | number]: string | number }): number[] {
	return Object.values(_enum)
		.filter((_) => !isNaN(Number(_)))
		.map(Number)
}

export function enum_keys(_enum: { [key: string | number]: string | number }): string[] {
	return Object.keys(_enum).filter((_) => isNaN(Number(_)))
}
