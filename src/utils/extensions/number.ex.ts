import "./string.ex"

export {}
declare global {
   interface Number {
      toCurrency(): string
   }
}

Number.prototype.toCurrency ??= function (this: number): string {
   const [integer, decimal] = this.toFixed(2).split(".")
   return [integer!.chunk(3, true).join(","), decimal].join(".")
}
