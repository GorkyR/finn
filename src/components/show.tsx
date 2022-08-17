type Child = undefined | null | number | string | JSX.Element
type ShowProps<T> = {
   when: T | undefined
   fallback?: Child
   children?: (Child | Child[]) | ((when: Exclude<T, false>) => Child | Child[])
}
export default function Show<T>({ when, fallback, children }: ShowProps<T>) {
   return (
      <>
         {when
            ? typeof children == "function"
               ? children(when as Exclude<T, false>)
               : children
            : fallback}
      </>
   )
}
