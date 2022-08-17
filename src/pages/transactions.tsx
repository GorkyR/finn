import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Icon from '../components/icon'
import Modal from '../components/modal'
import Show from '../components/show'
import { format_date } from '../utils/date.utils'
import { compare_months, date_to_month, format_month } from '../utils/month-year.utilities'
import { cx } from '../utils/react.utilities'
import { titlecase } from '../utils/string.utils'
import { useToggle } from '../utils/toggle.hook'
import { trpc } from '../utils/trpc'

type MonthYear = {
	month: number
	year: number
}

export default function TransactionsPage() {
	const [month, set_month] = useState<MonthYear>(date_to_month(new Date()))
	const { data: transaction_months, isLoading: loading_months } = trpc.useQuery(['transactions.months'])
	const { data: transactions, isLoading, refetch } = trpc.useQuery(['transactions.by-month', month])

	let months = (transaction_months ?? ([] as any[]))
		.concat(date_to_month(new Date()))
		.distinct((m) => m.year * 100 + m.month)
		.sort_by((m) => m.year * 100 + m.month, false)

	const new_tran = useToggle()

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
										<tr key={t.id}>
											<td>{format_date(t.date)}</td>
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
															className='px-1 rounded hover:bg-blue-200 cursor-default'>
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
