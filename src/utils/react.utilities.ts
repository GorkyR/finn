export function handle(callback: () => void) {
	return (event: { preventDefault: () => void }) => {
		event.preventDefault()
		callback()
	}
}

export function cx(
	...fragments: (false | string | { [key: string]: boolean | undefined } | undefined)[]
): string {
	return fragments
		.map((fragment) => {
			if (typeof fragment === 'string') return fragment
			else if (typeof fragment === 'object')
				return Object.keys(fragment)
					.filter((v) => fragment[v])
					.join(' ')
		})
		.filter((_) => _)
		.join(' ')
}

export function swx<T>(value: string | number, options: { [key: string | number]: T }, default_?: T): T {
	for (let key in options)
		if (key == value)
			//
			return options[key]!
	return default_ as T
}
