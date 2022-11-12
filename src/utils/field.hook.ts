import { Dispatch, SetStateAction, useState } from "react"
import { date } from "./date.utils"

type FieldProps<T> = {
   value: T
   set: Dispatch<SetStateAction<T>>
   props: {
      value: string | number | undefined
      onChange: ({ target: { value } }: any) => void
   }
}

export function useField<T>(): FieldProps<T | undefined>
export function useField<T>(initial: T): FieldProps<T>
export function useField<T>(initial?: T) {
   const [value, set] = useState(initial)
   return {
      value,
      set,
      props: {
         value: value instanceof Date ? value.to_short() : value,
         onChange: ({ target: { value: new_value } }: any) =>
            set(
               typeof value == "number"
                  ? Number(new_value)
                  : value instanceof Date
                  ? date(new_value)
                  : new_value
            ),
      },
   }
}
