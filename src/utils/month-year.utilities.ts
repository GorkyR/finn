export type MonthYear = {
	year: number
	month: number
}

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
export function format_month(month: MonthYear): string {
	return `${months_es[month.month]} ${month.year}`
}

export function date_to_month(date: Date): MonthYear {
	return { year: date.getFullYear(), month: date.getMonth() }
}

export function compare_months(a: MonthYear, b: MonthYear): number {
	const month_diff = b.month - a.month
	const year_diff = b.year - a.year
	return year_diff * 12 + month_diff
}
