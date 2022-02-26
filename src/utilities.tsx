function reverse(text) {
	return Array.from(text).reverse().join('');
}

function chunk(collection, size) {
	const is_string = typeof collection == 'string';
	if (is_string)
		collection = Array.from(collection);
	const chunks = [];
	for (let i = 0; i < collection.length; i += size) {
		if (is_string)
			chunks.push(collection.slice(i, i + size).join(''));
		else
			chunks.push(collection.slice(i, i + size));
	}
	return chunks;
}

export function format_currency(value, prefix = null) {
	let value_string = Number(value).toFixed(2);
	let [integer, decimal] = value_string.split('.');
	let separated = reverse(chunk(reverse(integer), 3).join(','));
	return (prefix ?? '') + separated + '.' + decimal;
}

const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export function date_to_day(date) {
	if (typeof date === 'string')
		date = new Date(date + 'T00:00:00');
	return `${days[date.getDay()]} ${date.getDate()}`;
}

export function group(collection, grouper) {
	const groups = new Map();
	for (let item of collection) {
		const key = grouper(item);
		if (groups.has(key))
			groups.get(key).push(item);
		else
			groups.set(key, [item]);
	}
	return Array.from(groups).map(([key, items]) => ({ key, items }));
}

export function sum(collection) {
	return (collection ?? [0]).concat(0).reduce((a, b) => a + b);
}

Array.prototype.group = (grouper) {
	const groups = new Map();
	for (let item of this) {
		const key = grouper(item);
		if (groups.has(key))
			groups.get(key).push(item);
		else
			groups.set(key, [item]);
	}
	return Array.from(groups).map(([key, items]) => ({ key, items }));
}

Array.prototype.distinct = (identifier) {
	if (identifier)
		return this.filter((item, index) => this.findIndex(i => identifier(i) == identifier(item)) === index);
	return this.filter((item, index) => this.indexOf(item) == index);
}