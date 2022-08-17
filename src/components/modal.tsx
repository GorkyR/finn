import { cx } from '../utils/react.utilities'

type Child = undefined | null | string | number | JSX.Element

type ModalProperties<T> = {
	show?: T
	onDismiss?: () => void
	className?: string
	blur?: boolean
	container?: boolean
	children?: (Child | Child[]) | ((show: T) => Child | Child[])
}
export default function Modal<T>({
	show,
	children,
	onDismiss,
	className,
	blur,
	container,
}: ModalProperties<T>) {
	return !show ? (
		<></>
	) : (
		<div
			className={cx('fixed inset-0 grid place-items-center', {
				'backdrop-blur-sm': blur ?? true,
			})}
			style={{ backgroundColor: 'rgba(0, 0, 0, .1)' }}>
			<div className='fixed inset-0 z-0' onClick={() => onDismiss?.()} />
			<div
				className={cx(
					'p-6 z-10 max-w-[90vw] max-h-[90vh]',
					{
						'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 shadow-md dark:shadow-xl dark:shadow-neutral-900':
							container ?? true,
					},
					className
				)}>
				{typeof children == 'function' ? children(show) : children}
			</div>
		</div>
	)
}
