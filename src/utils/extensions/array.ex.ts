export {}
declare global {
	interface Array<T> {
		chunk(length: number): T[][]
		split(count: number): T[][]

		interleave<I>(...items: I[]): (T | I)[]

		distinct(): T[]
		distinct<K>(key: (item: T) => K): T[]
		distinct<K>(key: (item: T, index: number) => K): T[]

		separate(predicate: (item: T) => boolean): [T[], T[]]
		separate(predicate: (item: T, index: number) => boolean): [T[], T[]]

		group<K>(key: (item: T) => K): (T[] & { key: K })[]
		group<K>(key: (item: T, index: number) => K): (T[] & { key: K })[]
		group<K>(key: (item: T, index: number) => K): (T[] & { key: K })[]

		sort_by<K>(key: (item: T) => K, ascending?: boolean): T[]

		// -------------------------

		sample(): T
		sample(count: number): T[]

		shuffle(): T[]
	}
}

Array.prototype.chunk ??= function <T>(this: T[], length: number): T[][] {
	const chunks: T[][] = []
	for (let i = 0; i < this.length; i += length) chunks.push(this.slice(i, i + length))
	return chunks
}

Array.prototype.split ??= function <T>(this: T[], count: number) {
	return this.chunk(Math.ceil(this.length / count))
}

Array.prototype.interleave ??= function <T, I>(this: T[], ...separators: I[]): (T | I)[] {
	if (this.length <= 1) return this.slice()
	const interleaved: (T | I)[] = [this[0]!]
	for (let item of this.slice(1)) interleaved.push(...separators, item)
	return interleaved
}

Array.prototype.distinct ??= function <T, K>(this: T[], keyer?: (item: T, index: number) => K): T[] {
	if (!keyer) return this.filter((item, index, array) => array.indexOf(item) === index)

	const keys = this.map(keyer)
	const distinct_indexes = keys
		.map((k, i) => [k, i] as [K, number])
		.filter(([key, index], _, array) => array.findIndex(([key_]) => key_ == key) === index)
		.map(([_, index]) => index)
	return distinct_indexes.map((index) => this[index]!)
}

Array.prototype.separate ??= function <T>(
	this: T[],
	predicate: (item: T, index: number) => boolean
): [T[], T[]] {
	return this.reduce(
		([accepted, rejected], item, index) =>
			predicate(item, index) ? [[...accepted, item], rejected] : [accepted, [...rejected, item]],
		[[], []] as [T[], T[]]
	)
}

Array.prototype.group ??= function <T, K>(
	this: T[],
	keyer: (item: T, index: number) => K
): (T[] & { key: K })[] {
	const groups = new Map<K, T[]>()
	for (let i = 0; i < this.length; i++) {
		const item = this[i]!
		const key = keyer(item, i)
		if (groups.has(key)) groups.get(key)?.push(item)
		else groups.set(key, [item])
	}
	return [...groups.entries()].map(([key, items]) => {
		;(items as any)['key'] = key
		return items as any
	})
}

Array.prototype.sort_by ??= function <T, K>(
	this: T[],
	keyer: (item: T) => K,
	ascending: boolean = true
): T[] {
	const collection = this.slice()
	return collection.sort((a, b) => {
		const ka = keyer(a)
		const kb: any = keyer(b)
		switch (typeof ka) {
			case 'number':
				if (ascending) return ka - kb
				else return kb - ka
			case 'string':
				if (ascending) return ka.localeCompare(kb)
				else return kb.localeCompare(ka)
			default:
				if (ka instanceof Date) {
					if (ascending) return ka.valueOf() - kb.valueOf()
					else return kb.valueOf() - ka.valueOf()
				}
				throw new Error(
					'Type of key is not straightforwardly comparable (?)\n' +
						'(Use .sort() and compare them yourself instead.)'
				)
		}
	})
}

const random = (limit: number): number => Math.floor(Math.random() * limit)
Array.prototype.sample ??= function <T>(this: T[], count?: number): T | T[] {
	if (count == undefined) return this[random(this.length)]!
	if (count > this.length) count = this.length
	const collection = this.slice()
	const sampled: T[] = []
	while (sampled.length < count) sampled.push(...collection.splice(random(collection.length), 1))
	return sampled
}

Array.prototype.shuffle ??= function <T>(this: T[]): T[] {
	return this.sample(this.length)
}
