import { useRef, useState } from 'react'
import { cx } from '../utils/react.utilities'

type Child = undefined | null | boolean | number | string | JSX.Element

type ModalProperties<T> = {
	when?: boolean | T
	children: Child | Child[] | ((data: T) => Child | Child[])
	className?: string
	onDismiss?: () => void

	blur?: boolean
}
export default function Modal<T>({ children, className, when: show, onDismiss, blur }: ModalProperties<T>) {
	const container = useRef<HTMLDivElement>()
	const content = useRef<HTMLDivElement>()
	const [is_dismissing, dismissing] = useState(false)
	return show ? (
		<div
			ref={container as any}
			onMouseDown={(e) => {
				if (!content.current?.contains(e.target as any)) dismissing(true)
			}}
			onMouseUp={(e) => {
				if (!content.current?.contains(e.target as any) && is_dismissing) onDismiss?.()
				dismissing(false)
			}}
			className={cx('fixed inset-0 bg-black bg-opacity-10 grid place-items-center', {
				'backdrop-blur': blur,
			})}>
			<div ref={content as any} className={cx('max-w-[95vw] max-h-[90vh]', className)}>
				{typeof children === 'function' ? children(show as T) : children}
			</div>
		</div>
	) : (
		<></>
	)
}
