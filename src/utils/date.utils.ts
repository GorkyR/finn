const months_es = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre',
]
const months_en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const short_months_es = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']
const short_months_en = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
export function format_date(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	switch (language) {
		case 'es':
			return `${date_.getDate()} de ${months_es[date_.getMonth()]}, ${date_.getFullYear()}`
		case 'en':
			return `${months_en[date_.getMonth()]} ${date_.getDate()}, ${date_.getFullYear()}`
		default:
			return date_.toDateString()
	}
}

export function format_date_short(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	switch (language) {
		case 'es':
			return `${date_.getDate()} de ${short_months_es[date_.getMonth()]}, ${date_.getFullYear()}`
		case 'en':
			return `${short_months_en[date_.getMonth()]} ${date_.getDate()}, ${date_.getFullYear()}`
		default:
			return date_.toDateString()
	}
}

export function format_datetime(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	let hours = date_.getHours()
	hours = hours > 12 ? hours - 12 : hours == 0 ? 12 : hours
	return `${hours.toString().padStart(2, '0')}:${date_.getMinutes().toString().padStart(2, '0')} ${
		date_.getHours() > 12 ? 'pm' : 'am'
	}, ${format_date(date_, language)}`
}

export function date(datelike: Date | string | number): Date {
	return new Date(typeof datelike === 'string' && datelike.length <= 10 ? datelike + 'T00:00' : datelike)
}

export function date_add(
	datelike: Date | string | number,
	{ years, months, days }: { years?: number; months?: number; days?: number }
): Date {
	const date_ = date(datelike)
	if (years) date_.setFullYear(date_.getFullYear() + years)
	if (months) date_.setMonth(date_.getMonth() + months)
	if (days) date_.setDate(date_.getDate() + days)
	return date_
}

export function today(): Date {
	const date = new Date()
	date.setHours(0, 0, 0, 0)
	return date
}

export function days_between(from: Date, to: Date): Date[] {
	const days = [from]
	while (from < to) {
		const next = from.add({ days: 1 })
		days.push(next)
		from = next
	}
	return days
}

export function is_same_day(a: Date, b: Date): boolean {
	return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth() && a.getDate() == b.getDate()
}

export function format_delta(date: Date) {
	const delta = date.delta()
	if (delta.days >= 1) {
		const days = Math.floor(delta.days)
		return `hace ${days} día${days == 1 ? '' : 's'}`
	}
	if (delta.hours >= 1) {
		const hours = Math.floor(delta.hours)
		return `hace ${hours} hora${hours == 1 ? '' : 's'}`
	}
	if (delta.minutes >= 1) {
		const minutes = Math.floor(delta.minutes)
		return `hace ${minutes} minuto${minutes == 1 ? '' : 's'}`
	}
	return 'hace unos momentos'
}
