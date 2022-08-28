export function distinct<T, K>(collection: T[], key?: (item: T) => K): T[] {
	if (key)
		return collection?.filter((item, index) => {
			const item_key = key(item)
			return collection.findIndex((i) => key(i) == item_key) === index
		})
	return collection?.filter((item, index) => collection.indexOf(item) === index)
}

export function group<T, K>(collection: T[], key: (item: T) => K): { key: K; items: T[] }[] {
	const groups = new Map<K, T[]>()
	for (let item of collection) {
		const key_value = key(item)
		if (groups.has(key_value)) {
			groups.get(key_value)?.push(item)
		} else {
			groups.set(key_value, [item])
		}
	}
	return [...groups.entries()].map(([key, items]) => ({ key, items }))
}

export function invert_group<T, K>(collection: T[], grouping: (item: T) => K[]): { key: K; items: T[] }[] {
	const groups = new Map<K, T[]>()
	for (let item of collection) {
		const keys = grouping(item)
		for (const key of keys) {
			if (groups.has(key)) {
				groups.get(key)!.push(item)
			} else {
				groups.set(key, [item])
			}
		}
	}
	return [...groups.entries()].map(([key, items]) => ({ key, items }))
}

export function chunk<T>(collection: T[], chunk_length: number): T[][] {
	if (collection?.length <= chunk_length) return [collection?.slice()]
	const chunks: T[][] = []
	for (let i = 0; i < collection?.length; i += chunk_length)
		chunks.push(collection?.slice(i, i + chunk_length))
	return chunks
}

export function split_into<T>(collection: T[], count: number): T[][] {
	return chunk(collection, Math.ceil(collection?.length / count))
}

export function interspace<T>(collection: T[], interspaced_element: T): T[] {
	if (!collection?.length) return collection
	let interspaced: T[] = [collection[0]!]
	for (const element of collection.slice(1)) {
		interspaced.push(...[interspaced_element, element])
	}
	return interspaced
}

export function sort_by<T, K>(collection: T[], key: (item: T) => K, ascending: boolean = true): T[] {
	collection = collection?.slice()
	return collection.sort((a, b) => {
		const ka = key(a)
		const kb = key(b)
		if (ascending) return <any>ka - <any>kb
		else return <any>kb - <any>ka
	})
}

export function flatten<T>(collection: T[][]): T[] {
	return collection?.reduce((flat, next) => flat.concat(next), [])
}

export function sum(collection: number[]): number {
	return collection?.reduce((accumulator, number) => accumulator + number, 0) ?? 0
}

export function range(count: number): number[]
export function range(start: number, end: number): number[]
export function range(start: number, end: number, step: number): number[]
export function range(start_or_count: number, end?: number, step = 1): number[] {
	if (end === undefined) {
		end = start_or_count
		start_or_count = 0
	}
	const values: number[] = []
	for (let i = start_or_count; i < end; i += step) {
		values.push(i)
	}
	return values
}
