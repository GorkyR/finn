import { useState } from 'react'

export function useToggle(initial?: boolean) {
	const [flag, setFlag] = useState(initial ?? false)
	return {
		on: flag,
		toggle: () => setFlag((b) => !b),
		turn_on: () => setFlag(true),
		turn_off: () => setFlag(false),
	}
}
