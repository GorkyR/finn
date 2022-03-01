import { flatten } from "./utilities";

declare global {
	interface Array<T> {
		group<K>(key: (item: T) => K): { key: K; items: T[]; }[];
		categorize<K>(from: (item: T) => K[]): { key: K; items: T[]; }[];
		distinct<K>(key?: (item: T) => K): T[];
		chunk(size: number): T[][];
		sort_by<K>(key: (item: T) => K, reverse?: boolean): T[];
	}

	interface String {
		reversed(): string;
		chunk(size: number): string[]
	}
}

if (!Array.prototype.group) {
	Array.prototype.group = function<T, K>(grouper: (item: T) => K): { key: K; items: T[]; }[] {
		const groups = new Map<K, T[]>();
		for (let item of this) {
			const key = grouper(item);
			if (groups.has(key))
				groups.get(key)?.push(item);
			else
				groups.set(key, [item]);
		}
		return Array.from(groups).map(([key, items]) => ({ key, items }));
	}
}

if (!Array.prototype.categorize){
	Array.prototype.categorize = function<T, K>(categories: (item: T) => K[]): { key: K; items: T[]; }[] {
		return flatten(this.map(item => categories(item).map(category => ({ category, item }))))
		.group(cg => cg.category)
		.map(({ key, items }) => ({ key, items: items.map(item => item.item) }));
	}
}

if (!Array.prototype.distinct) {
	Array.prototype.distinct = function<T, K>(identifier?: (item: T) => K): T[] {
		if (identifier)
			return this.filter((item, index) => this.findIndex(i => identifier(i) == identifier(item)) === index);
		return this.filter((item, index) => this.indexOf(item) == index);
	}
}

if (!Array.prototype.chunk) {
	Array.prototype.chunk = function(size: number) {
		const chunks = [];
		for (let i = 0; i < this.length; i += size)
			chunks.push(this.slice(i, i + size));
		return chunks;
	}
}

if (!Array.prototype.sort_by) {
	Array.prototype.sort_by = function<T, K>(key: (item: T) => K, reverse: boolean = false): T[] {
		if (this.length <= 1)
			return this;
		return this.sort((a, b) => {
			a = key(a); b = key(b);
			return (a > b? 1 : a < b? -1 : 0) * (reverse? -1 : 1);
		})
	}
}

if (!String.prototype.reversed) {
	String.prototype.reversed = function(): string { return Array.from(this).reverse().join(''); }
}

if (!String.prototype.chunk) {
	String.prototype.chunk = function(size: number): string[] {
		const chunks = [];
		for (let i = 0; i < this.length; i += size)
			chunks.push(this.substring(i, i + size));
		return chunks;
	}
}
export {}