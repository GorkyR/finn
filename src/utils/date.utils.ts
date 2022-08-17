const months_es = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const months_en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
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
export function format_datetime(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	let hours = date_.getHours()
	hours = hours > 12? hours - 12 : hours == 0? 12 : hours
	return `${hours.toString().padStart(2, '0')}:${date_.getMinutes().toString().padStart(2, '0')} ${date_.getHours() > 12? 'pm' : 'am'}, ${format_date(date_, language)}`
}

export function date(datelike: Date | string | number): Date {
	return new Date(typeof datelike === 'string' && datelike.length <= 10? datelike+'T00:00' : datelike)
}

export function date_add(datelike: Date | string | number, { years, months, days }: { years?: number, months?: number, days?: number }): Date {
	let date_ = date(datelike)
	if (years)  date_.setFullYear(date_.getFullYear() + years )
	if (months) date_.setMonth(   date_.getMonth()    + months)
	if (days)   date_.setDate(    date_.getDate()     + days  )
	return date_
}
