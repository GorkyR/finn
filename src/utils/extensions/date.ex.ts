export {}
declare global {
	interface Date {
		add(time: { milliseconds?: number, seconds?: number, minutes?: number, hours?: number, days?: number, months?: number, years?: number }): Date
		set(date: { millisecond?: number, second?: number, minute?: number, hour?: number, day?: number, month?: number, year?: number }): Date

		to_short(): string
	}
}

Date.prototype.set = function({ millisecond, second, minute, hour, day, month, year }): Date {
	const date = new Date(this)
	if (year        != null) date.    setFullYear(year)
	if (month       != null) date.       setMonth(month)
	if (day         != null) date.        setDate(day)
	if (hour        != null) date.       setHours(hour)
	if (minute      != null) date.     setMinutes(minute)
	if (second      != null) date.     setSeconds(second)
	if (millisecond != null) date.setMilliseconds(millisecond)
	return date
}

Date.prototype.add = function({ milliseconds, seconds, minutes, hours, days, months, years }): Date {
	const date = new Date(this)
	if (years)        date.    setFullYear( date.    getFullYear() + years        )
	if (months)       date.       setMonth( date.       getMonth() + months       )
	if (days)         date.        setDate( date.        getDate() + days         )
	if (hours)        date.       setHours( date.       getHours() + hours        )
	if (minutes)      date.     setMinutes( date.     getMinutes() + minutes      )
	if (seconds)      date.     setSeconds( date.     getSeconds() + seconds      )
	if (milliseconds) date.setMilliseconds( date.getMilliseconds() + milliseconds )
	return date
}

Date.prototype.to_short = function() {
	return `${ this.getFullYear() }-${ (this.getMonth() + 1).toString().padStart( 2, '0' ) }-${ this.getDate().toString().padStart( 2, '0' ) }`
}