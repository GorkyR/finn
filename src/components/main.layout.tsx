import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { signOut } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { cx } from '../utils/react.utilities'
import Icon from './icon'

type Child = undefined | null | boolean | number | string | JSX.Element
type MenuItem = {
	label: string
	link?: string
	icon?: IconProp
	children?: MenuItem[]
}

const menu: MenuItem[] = [
	{ label: 'Transacciones', icon: 'receipt', link: '/transactions' },
	{ label: 'Gastos', icon: 'hand-holding-dollar', link: '/expenses' },
	{ label: 'Ingresos', icon: 'coins', link: '/income' },
	{ label: 'Presupuestos', icon: 'scale-unbalanced', link: '/bugets' },
]

export default function MainLayout({ children, title }: { title: string; children: Child | Child[] }) {
	const router = useRouter()
	const path = router.pathname
	const navigate = router.push
	const actives = useMemo(() => {
		function active(item: MenuItem): MenuItem[] {
			if (item.link == path) return [item]
			const actives = [...(item.children?.map(active) ?? []).flat(1)]
			if (actives.length) return [item, ...actives]
			return []
		}

		return menu
			.map(active)
			.flat(1)
			.filter((i) => i.children?.length)
	}, [router.pathname])
	const [expanded, setExpanded] = useState(actives)

	function item(i: MenuItem, key: number) {
		const is_expanded = expanded.includes(i)
		return (
			<div key={key}>
				<div
					onClick={() => {
						if (i.link) navigate(i.link)
						else if (i.children?.length) setExpanded((e) => (e.includes(i) ? e.filter((_i) => _i != i) : [...e, i]))
					}}
					className={cx(
						'flex flex-row gap-2 items-center',
						i.link || i.children?.length ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
						i.link && 'hover:underline',
						i.link === path && 'underline decoration-blue-500'
					)}>
					{i.icon && <Icon icon={i.icon} />}
					<span className='flex-1'>{i.label}</span>
					{i.children?.length && <Icon icon={is_expanded ? 'angle-down' : 'angle-right'} />}
				</div>
				{i.children?.length && is_expanded && <div className='pl-3 ml-2 border-l border-neutral-300'>{i.children.map(item)}</div>}
			</div>
		)
	}

	return (
		<>
			<Head>
				<title>{`${title ? title + ' | ' : ''} Xpen$`}</title>
			</Head>

			<section className='mx-auto min-h-screen max-h-screen flex items-stretch'>
				<section className='min-w-max p-4 flex flex-col gap-2 border-r border-neutral-200'>
					{/* Sidebar */}
					<h1 className='font-semibold text-xl text-center'>Xpen$</h1>
					{menu.map(item)}
					<div className='flex-1' />
					<div
						onClick={() => {
							signOut()
						}}
						className='flex flex-row gap-2 items-center cursor-pointer decoration-red-500 hover:underline'>
						<Icon icon='sign-out' /> Salir
					</div>
				</section>
				<main className='container mx-auto flex-1 pt-4 pl-4'>{children}</main>
			</section>
		</>
	)
}
