const weekdays_es = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export function format_day(date: Date): string {
	return `${weekdays_es[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}`
}
