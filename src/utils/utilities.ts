import './extensions';

export function format_currency(value: number, prefix?: string) {
	const is_negative = value < 0;
	if (is_negative)
		value *= -1;
	let value_string = Number(value).toFixed(2);
	let [integer, decimal] = value_string.split('.');
	let separated = integer.reversed().chunk(3).join(',').reversed();
	return (is_negative? '-' : '') + (prefix ?? '') + separated + '.' + decimal;
}

const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export function date_to_day(date: Date | string) {
	if (typeof date === 'string')
		date = new Date(date + 'T00:00:00');
	return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}`;
}

export function sum(collection: number[]): number {
	return (collection ?? [0]).concat(0).reduce((a, b) => a + b);
}

export function flatten<T>(collection: T[][]): T[] {
	return (collection ?? [[]]).concat([[]]).reduce((a, b) => a.concat(b));
}

export function export_text_file(filename: string, contents: string) {
   var element = document.createElement('a');
   element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(contents)}`;
   element.download = filename;
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}

export function export_file(filename: string, dataurl: string) {
   var element = document.createElement('a');
   element.href = dataurl;
   element.download = filename;
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}