import React, { ReactNode, useContext, useState } from 'react'
import { cx, swx } from '../../utils/react.utilities'
import Icon from '../icon'

import styles from './toaster.module.scss'

type ToastType = 'success' | 'warning' | 'info' | 'error'
type Toast = {
	id: string
	type: ToastType
	message: string
}
export type ToastFunction = (
	type: ToastType,
	message: string,
	duration_in_milliseconds?: number | 'keep'
) => void

const ToasterContext: React.Context<{ toast: ToastFunction }> = React.createContext({
	toast: (..._) => {}, //eslint-disable-line
})

type Child = undefined | null | number | string | JSX.Element | ReactNode
interface ToasterProperties {
	top?: boolean
	bottom?: boolean
	left?: boolean
	right?: boolean
	center?: boolean

	children?: Child | Child[]
	className?: string
}
function Toaster({ children, className, top, bottom, left, center, right }: ToasterProperties) {
	const [toasts, setToasts] = useState([] as Toast[])

	let i = 0
	const toast: ToastFunction = (type, message, duration = 5_000) => {
		const toast = { type, message, id: '' + Date.now() + i++ }
		setToasts((toasts) => [...toasts, toast])
		if (duration === 'keep' || duration === Number.POSITIVE_INFINITY) return
		setTimeout(() => {
			setToasts((toasts) => toasts.filter((t) => t !== toast))
		}, duration)
	}

	const toast_styles: { [key in ToastType]: string | undefined } = {
		success: styles.success,
		warning: styles.warning,
		info: styles.info,
		error: styles.error,
	}

	return (
		<section className={cx(styles.toaster, className)}>
			<ToasterContext.Provider value={{ toast }}>{children}</ToasterContext.Provider>
			<section
				className={cx(styles.toasts, {
					[styles.top!]: top,
					[styles.bottom!]: bottom,
					[styles.left!]: left,
					[styles.center!]: center,
					[styles.right!]: right,
				})}>
				{toasts.map((toast) => (
					<div key={toast.id} className={cx(styles.toast, toast_styles[toast.type])}>
						<Icon
							icon='times'
							className={styles.dismiss}
							onClick={() => setToasts((toasts) => toasts.filter((t) => t != toast))}
						/>
						<Icon
							className={styles.icon}
							icon={swx(
								toast.type,
								{
									error: ['far', 'circle-xmark'],
									info: 'circle-info',
									warning: 'triangle-exclamation',
									success: 'circle-check',
								},
								'circle-info'
							)}
						/>
						<p>{toast.message}</p>
					</div>
				))}
			</section>
		</section>
	)
}

const useToast = (): ToastFunction => useContext(ToasterContext).toast

export default Toaster
export { ToasterContext, Toaster, useToast }
