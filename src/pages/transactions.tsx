import { Tag, Transaction } from '@prisma/client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Icon from '../components/icon'
import Modal from '../components/modal'
import Show from '../components/show'
import { invert_group, sum } from '../utils/array.utils'
import { format_date } from '../utils/date.utils'
import { format_day } from '../utils/day-month.utilities'
import { compare_months, date_to_month, format_month } from '../utils/month-year.utilities'
import { cx } from '../utils/react.utilities'
import { titlecase } from '../utils/string.utils'
import { useToggle } from '../utils/toggle.hook'
import { trpc } from '../utils/trpc'
import { WithMainLayout } from './_app'

type MonthYear = {
	month: number
	year: number
}

function month_days(month: MonthYear): Date[] {
	const first = new Date(month.year, month.month, 1)
	const last_plus_one = first.add({ months: 1 })
	const number_of_days = compare_months(date_to_month(new Date()), month)
		? first.delta(last_plus_one).days
		: new Date().getDate()
	const days = []
	for (let i = 0; i < number_of_days; i++) {
		days.push(first.add({ days: i }))
	}
	return days
}

const TransactionsPage = () => {
	const [month, set_month] = useState<MonthYear>(date_to_month(new Date()))
	const { data: transaction_months, isLoading: loading_months } = trpc.useQuery(['transactions.months'])
	const { data: transactions, isLoading, refetch } = trpc.useQuery(['transactions.by-month', month])

	let months = (transaction_months ?? ([] as any[]))
		.concat(date_to_month(new Date()))
		.distinct((m) => m.year * 100 + m.month)
		.sort_by((m) => m.year * 100 + m.month, false)

	const new_tran = useToggle()

	const [focused_tag, set_tag] = useState<string>()
	const [focused_day, set_day] = useState<number>()

	if (loading_months) return <Icon icon='spinner' size='2x' pulse />

	return (
		<section className='container mx-auto p-2'>
			<header className='flex flex-nowrap mb-6 gap-8 items-baseline overflow-x-auto'>
				{months.map((m) => (
					<div
						onClick={() => set_month(m)}
						className={cx(
							'px-2 rounded min-w-max',
							!compare_months(month, m)
								? 'text-xl px-1 font-medium underline decoration-blue-500 underline-offset-2'
								: 'cursor-pointer hover:underline decoration-blue-300'
						)}>
						{titlecase(format_month(m))}
					</div>
				))}
			</header>

			<Show when={!isLoading && transactions} fallback={<Icon icon='spinner' size='2x' pulse />}>
				{(transactions) => (
					<>
						<button onClick={new_tran.turn_on} className='button mb-4'>
							Nueva transacción
						</button>

						<div className='flex flex-row items-start gap-4'>
							<div className='flex-1'>
								<Transactions
									transactions={transactions}
									focused={{ tag: focused_tag, day: focused_day }}
									onTagFocus={set_tag}
									onDayFocus={set_day}
								/>
							</div>

							<MonthDays
								transactions={transactions}
								month={month}
								focused_day={focused_day}
								onDayFocus={set_day}
							/>

							<Tags transactions={transactions} focused_tag={focused_tag} onTagFocus={set_tag} />
						</div>
					</>
				)}
			</Show>

			<Modal show={new_tran.on} onDismiss={new_tran.turn_off} className='min-w-[400px]'>
				<RegisterTransaction
					onRegistered={() => {
						new_tran.turn_off()
						refetch()
					}}
				/>
			</Modal>
		</section>
	)
}

interface TransactionsProps {
	transactions: (Transaction & { tags: Tag[] })[]
	focused?: {
		tag?: string
		day?: number
	}
	onTagFocus?: (name?: string) => void
	onDayFocus?: (day?: number) => void
}
const Transactions = ({ transactions, focused, onTagFocus, onDayFocus }: TransactionsProps) => {
	const total = sum(transactions.map((t) => Number(t.amount)) ?? [])
	const expense = sum(transactions.filter((t) => Number(t.amount) > 0).map((t) => Number(t.amount)) ?? [])

	return (
		<>
			<table className='table'>
				<thead>
					<tr>
						<th>Fecha</th>
						<th>Destino</th>
						<th>Concepto</th>
						<th colSpan={3}>Monto</th>
						<th>Etiquetas</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{transactions
						.sort_by((t) => t.id, false)
						.sort_by((t) => t.date, false)
						.map((t) => (
							<tr
								key={t.id}
								className={cx({
									'!bg-red-500 !text-white':
										t.tags.some((t) => t.name == focused?.tag) || t.date.getDate() == focused?.day,
								})}>
								<td>
									<span
										onMouseEnter={() => onDayFocus?.(t.date.getDate())}
										onMouseLeave={() => onDayFocus?.()}>
										{format_date(t.date)}
									</span>
								</td>
								<td>{t.destination}</td>
								<td className='whitespace-pre-wrap'>{t.description}</td>
								<td className='w-0 !pr-1'>RD$</td>
								<td className='w-0 !pl-1 text-right'>{Number(t.amount).toCurrency()}</td>
								<td />
								<td>
									<div className='flex gap-1'>
										{t.tags.map((t) => (
											<div
												key={t.id}
												onMouseEnter={() => onTagFocus?.(t.name)}
												onMouseLeave={() => onTagFocus?.()}
												className={cx('px-1 rounded hover:bg-blue-200 cursor-default')}>
												{t.name}
											</div>
										))}
									</div>
								</td>
								<td></td>
							</tr>
						))}
				</tbody>
			</table>
			<div className='flex justify-between'>
				<div>Gastos: RD$ {expense.toCurrency()}</div>
				<div>Ingresos: RD$ {(-total + expense).toCurrency()}</div>
				<div>Neto: RD$ {(-total).toCurrency()}</div>
			</div>
		</>
	)
}

interface MonthDaysProps {
	transactions: Transaction[]
	month: MonthYear
	focused_day?: number
	onDayFocus?: (day?: number) => void
}
const MonthDays = ({ transactions, month, focused_day, onDayFocus }: MonthDaysProps) => {
	return (
		<table className='table !w-max'>
			<thead>
				<tr>
					<th>Día</th>
					<th colSpan={2}>Gasto</th>
				</tr>
			</thead>
			<tbody>
				{month_days(month).map((date) => (
					<tr
						key={date.valueOf()}
						onMouseEnter={() => onDayFocus?.(date.getDate())}
						onMouseLeave={() => onDayFocus?.()}
						className={cx({ '!bg-red-500 !text-white': date.getDate() == focused_day })}>
						<td className='text-right'>{titlecase(format_day(date), 'es')}</td>
						<td className='w-0 !pr-1'>RD$</td>
						<td className='w-0 !pl-1 text-right'>
							{sum(
								transactions
									.filter((t) => t.date.to_short() == date.to_short())
									.filter((t) => Number(t.amount) > 0)
									.map((t) => Number(t.amount))
							).toCurrency()}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

interface TagsProps {
	transactions: (Transaction & { tags: Tag[] })[]
	focused_tag?: string
	onTagFocus?: (name?: string) => void
}
const Tags = ({ transactions, focused_tag, onTagFocus }: TagsProps) => {
	const tags = invert_group(transactions ?? [], (t) => t.tags.map((t) => t.name))
		.sort_by((g) => g.key)
		.sort_by((g) => sum(g.items.filter((t) => Number(t.amount) > 0).map((t) => Number(t.amount))), false)

	const expense = sum(transactions.filter((t) => Number(t.amount) > 0).map((t) => Number(t.amount)) ?? [])

	return (
		<table className='table !w-max'>
			<thead>
				<tr>
					<th>Etiqueta</th>
					<th>Porcentaje</th>
					<th colSpan={2}>Gasto</th>
				</tr>
			</thead>
			<tbody>
				{tags?.map((tag) => (
					<tr
						key={tag.key}
						onMouseEnter={() => onTagFocus?.(tag.key)}
						onMouseLeave={() => onTagFocus?.()}
						className={cx({ '!bg-red-500 !text-white': tag.key == focused_tag })}>
						<td>{tag.key}</td>
						<td className='text-right'>
							{(
								(sum(tag.items.filter((t) => Number(t.amount) > 0).map((t) => Number(t.amount))) /
									expense) *
								100
							).toFixed(1)}
							%
						</td>
						<td className='w-0 !pr-1'>RD$</td>
						<td className='w-0 !pl-1 text-right'>
							{sum(
								tag.items.filter((t) => Number(t.amount) >= 0).map((t) => Number(t.amount))
							).toCurrency()}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

function RegisterTransaction({ onRegistered }: { onRegistered: (id: number) => void }) {
	type TransactionForm = {
		date: Date
		destination: string
		description?: string
		amount: number
		tags: string
		expense: boolean
	}
	const {
		register: field,
		setValue,
		handleSubmit,
	} = useForm<TransactionForm>({
		defaultValues: {
			date: new Date().to_short() as any,
			expense: true,
			amount: 0,
		},
	})

	const { mutate: create, isLoading: working } = trpc.useMutation(['transactions.new'], {
		onSuccess: onRegistered,
	})

	function register(data: TransactionForm) {
		console.debug('data:', data)

		const tags = data.tags
			.split(',')
			.map((t) => t.trim())
			.filter((_) => _)
		create({ ...data, tags, amount: data.expense ? data.amount : -data.amount })
	}

	return (
		<form onSubmit={handleSubmit(register)} className='grid gap-3'>
			<h1 className='font-medium text-lg'>Registrar transacción</h1>

			<div className='grid'>
				<label htmlFor='date' className='label'>
					Fecha
				</label>
				<input
					id='date'
					{...field('date', {
						valueAsDate: true,
						required: true,
						disabled: working,
					})}
					max={new Date().to_short()}
					title='Fecha'
					type='date'
					className='input'
				/>
			</div>

			<div className='grid'>
				<label htmlFor='destination' className='label'>
					Destino
				</label>
				<input
					id='destination'
					type='text'
					{...field('destination', { required: true, minLength: 3, disabled: working })}
					title='Destino'
					placeholder='ej. Hipermercados Olé'
					className='input'
				/>
			</div>

			<div className='grid'>
				<label htmlFor='concept' className='label'>
					Concepto
				</label>
				<textarea
					id='concept'
					{...field('description', { disabled: working })}
					title='Concepto'
					rows={2}
					placeholder='ej. artículos del hogar'
					className='input'
				/>
			</div>

			<div className='grid'>
				<label htmlFor='amount' className='label'>
					Monto
				</label>
				<div className='input'>
					<span>RD$ </span>
					<input
						id='amount'
						type='number'
						{...field('amount', { valueAsNumber: true, min: 0, disabled: working })}
						title='Monto'
						placeholder='0.00'
						min={0}
						className='text-right'
					/>
				</div>
			</div>

			<div className='grid'>
				<label htmlFor='tags' className='label'>
					Etiquetas
				</label>
				<input
					id='tags'
					{...field('tags', { disabled: working })}
					type='text'
					title='Etiquetas'
					placeholder='ej. work, home'
					className='input'
				/>
			</div>

			<div className='flex flex-row-reverse gap-3'>
				<button
					type='submit'
					onClick={() => {
						setValue('expense', true)
					}}
					disabled={working}
					className='button'>
					Gasto
				</button>
				<button
					onClick={() => {
						setValue('expense', false)
					}}
					disabled={working}
					className='button'>
					Ingreso
				</button>
				<input type='hidden' {...field('expense')} />
			</div>
		</form>
	)
}

export default WithMainLayout(TransactionsPage, 'Transactions')
