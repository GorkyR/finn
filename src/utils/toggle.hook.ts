import { useState } from 'react'

export default function useToggle(
	initial?: boolean,
	options?: {
		onTrue?: () => void
		onFalse?: () => void
		onChange?: () => void
	}
) {
	const [state, setState] = useState(initial ?? false)
	const toggle: {
		(): boolean
		(state: boolean): void
	} & {
		on: () => void
		off: () => void
		toggle: () => void
	} = ((new_state?: boolean) => {
		if (new_state) options?.onTrue?.()
		if (new_state === false) options?.onFalse?.()
		if (new_state != null) {
			setState(new_state)
			if (new_state != state) options?.onChange?.()
		} else return state
	}) as any
	toggle.on = () => {
		setState(true)
		options?.onTrue?.()
		if (!state) options?.onChange?.()
	}
	toggle.off = () => {
		setState(false)
		options?.onFalse?.()
		if (state) options?.onChange?.()
	}
	toggle.toggle = () => {
		setState((s) => !s)
		if (state) options?.onFalse?.()
		else options?.onTrue?.()
		options?.onChange?.()
	}
	return toggle
}
