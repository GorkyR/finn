export {}
declare global {
   interface String {
      reverse(): string
      chunk(length: number, from_end?: boolean): string[]
   }
}

String.prototype.reverse ??= function (this: string): string {
   return [...this].reverse().join("")
}

function chunk(collection: string[], length: number) {
   const chunks: string[][] = []
   for (let i = 0; i < collection.length; i += length) chunks.push(collection.slice(i, i + length))
   return chunks
}
String.prototype.chunk ??= function (
   this: string,
   length: number,
   from_end: boolean = false
): string[] {
   if (from_end)
      return chunk([...this].reverse(), length)
         .reverse()
         .map((t) => t.reverse().join(""))
   return chunk([...this], length).map((t) => t.join(""))
}
