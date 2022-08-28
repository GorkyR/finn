export {}
declare global {
   interface Date {
      add(time: {
         milliseconds?: number
         seconds?: number
         minutes?: number
         hours?: number
         days?: number
         months?: number
         years?: number
      }): Date
      set(date: {
         millisecond?: number
         second?: number
         minute?: number
         hour?: number
         day?: number
         month?: number
         year?: number
      }): Date

      delta(date?: Date): {
         milliseconds: number
         seconds: number
         minutes: number
         hours: number
         days: number
      }
      has_been(time: {
         milliseconds?: number
         seconds?: number
         minutes?: number
         hours?: number
         days?: number
      }): boolean

      to_short(): string
   }
}

Date.prototype.set ??= function (
   this: Date,
   { millisecond, second, minute, hour, day, month, year }
): Date {
   const date = new Date(this)
   if (year != null) date.setFullYear(year)
   if (month != null) date.setMonth(month)
   if (day != null) date.setDate(day)
   if (hour != null) date.setHours(hour)
   if (minute != null) date.setMinutes(minute)
   if (second != null) date.setSeconds(second)
   if (millisecond != null) date.setMilliseconds(millisecond)
   return date
}

Date.prototype.add ??= function (
   this: Date,
   { milliseconds, seconds, minutes, hours, days, months, years }
): Date {
   const date = new Date(this)
   if (years) date.setFullYear(date.getFullYear() + years)
   if (months) date.setMonth(date.getMonth() + months)
   if (days) date.setDate(date.getDate() + days)
   if (hours) date.setHours(date.getHours() + hours)
   if (minutes) date.setMinutes(date.getMinutes() + minutes)
   if (seconds) date.setSeconds(date.getSeconds() + seconds)
   if (milliseconds) date.setMilliseconds(date.getMilliseconds() + milliseconds)
   return date
}

Date.prototype.delta ??= function (this: Date, date?: Date) {
   const milliseconds = (date ?? new Date()).valueOf() - this.valueOf()
   return {
      milliseconds,
      seconds: milliseconds / 1_000,
      minutes: milliseconds / (1_000 * 60),
      hours: milliseconds / (1_000 * 60 * 60),
      days: milliseconds / (1_000 * 60 * 60 * 24),
   }
}

Date.prototype.has_been ??= function (
   this: Date,
   { milliseconds, seconds, minutes, hours, days }
): boolean {
   milliseconds =
      (milliseconds ?? 0) +
      (seconds ?? 0) * 1_000 +
      (minutes ?? 0) * 1_000 * 60 +
      (hours ?? 0) * 1_000 * 60 * 60 +
      (hours ?? 0) * 1_000 * 60 * 60 * 24
   const ellapsed = this.valueOf() - Date.now()
   return milliseconds <= ellapsed
}

Date.prototype.to_short ??= function (this: Date) {
   return `${this.getFullYear()}-${(this.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${this.getDate().toString().padStart(2, "0")}`
}
