import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Icon from '../components/icon'
import Modal from '../components/modal'
import { useToast } from '../components/toaster/toaster'
import { RecurrencyMode } from '../enums/recurrency-modes.enum'
import { sum } from '../utils/array.utils'
import { date, format_date, today } from '../utils/date.utils'
import { enum_values } from '../utils/enum.utils'
import { cx } from '../utils/react.utilities'
import useToggle from '../utils/toggle.hook'
import { inferMutationInput, inferQueryOutput, trpc } from '../utils/trpc'
import { WithMainLayout } from './_app'

const ExpensesPage = () => {
	const { data: expenses, isLoading, refetch } = trpc.useQuery(['expenses.all'])
	const new_expense = useToggle()
	const toast = useToast()
	const [edited_expense, edit] = useState<Exclude<typeof expenses, undefined>[number]>()
	const { mutate: remove, isLoading: working } = trpc.useMutation(['expenses.remove'], {
		onSuccess: () => {
			toast('success', 'Gasto eliminado.')
			refetch()
		},
	})

	if (isLoading || !expenses) return <Icon icon='spinner' pulse size='2x' />

	const modes = enum_values(RecurrencyMode).reduce((o, r) => {
		const e = expenses.filter((e) => e.repeats == r && e.date_start < today() && !e.expired).map((e) => ({ lower: e.lower_amount, upper: e.upper_amount }))
		const mode = { lower: sum(e.map((e) => e.lower)), upper: sum(e.map((e) => e.upper)) }
		return { ...o, [r]: mode }
	}, {} as { [key: number]: { lower: number; upper: number } })

	const annual = {
		lower:
			modes[RecurrencyMode.Anual]!.lower +
			modes[RecurrencyMode.Mensual]!.lower * 12 +
			modes[RecurrencyMode.Semanal]!.lower * 52 +
			modes[RecurrencyMode.Diario]!.lower * 365,
		upper:
			modes[RecurrencyMode.Anual]!.upper +
			modes[RecurrencyMode.Mensual]!.upper * 12 +
			modes[RecurrencyMode.Semanal]!.upper * 52 +
			modes[RecurrencyMode.Diario]!.upper * 365,
	}

	return (
		<section className='container mx-auto p-2'>
			<button onClick={new_expense.on} className='button mb-4'>
				Nuevo gasto
			</button>

			<div className='flex gap-4 items-start'>
				<div className='flex-1'>
					<table className='table'>
						<thead>
							<tr>
								<th>Descripción</th>
								<th colSpan={4}>Monto</th>
								<th>Recurrencia</th>
								<th>Desde</th>
								<th>Hasta</th>
								<th className='w-0' />
							</tr>
						</thead>
						<tbody>
							{expenses
								.sort_by((e) => (e.expired ? 1 : 0))
								.map((e) => (
									<tr key={e.id} className={cx({ 'text-neutral-300': e.expired })}>
										<td title={e.description ?? undefined}>{e.name}</td>

										<td className='w-0 !pr-0'>RD$</td>
										<td className='w-0 !pr-0 text-right'>{((e.lower_amount + e.upper_amount) / 2).toCurrency()}</td>
										<td className='w-0 text-right'>(±{((e.upper_amount - e.lower_amount) / 2).toCurrency()})</td>
										<td />

										<td>{RecurrencyMode[e.repeats]}</td>

										<td>
											<div className='min-w-max'>{format_date(e.date_start)}</div>
										</td>
										<td>
											<div className='min-w-max'>{e.date_end ? format_date(e.date_end) : 'Presente'}</div>
										</td>

										<td>
											<div className='flex gap-2'>
												<button onClick={() => edit(e)} className='button'>
													<Icon icon='edit' />
												</button>
												<button
													onClick={() => {
														if (confirm('¿Eliminar gasto? (Si desea terminar el gasto, puede modificar su fecha de fin.)')) remove(e.id)
													}}
													className='button'>
													<Icon icon={['far', 'trash-alt']} />
												</button>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>

					<div className='mt-6 flex justify-between'>
						<div>
							Diario: RD$ {((annual.upper + annual.lower) / 365 / 2).toCurrency()} (±
							{((annual.upper - annual.lower) / 365 / 2).toCurrency()})
						</div>
						<div>
							Semanal: RD$ {((annual.upper + annual.lower) / 52 / 2).toCurrency()} (±
							{((annual.upper - annual.lower) / 52 / 2).toCurrency()})
						</div>
						<div>
							Mensual: RD$ {((annual.upper + annual.lower) / 12 / 2).toCurrency()} (±
							{((annual.upper - annual.lower) / 12 / 2).toCurrency()})
						</div>
						<div>
							Anual: RD$ {((annual.upper + annual.lower) / 2).toCurrency()} (±
							{((annual.upper - annual.lower) / 2).toCurrency()})
						</div>
					</div>
				</div>

				<table className='table max-w-max'>
					<thead>
						<tr>
							<th>Período</th>
							<th colSpan={4}>Gastos</th>
						</tr>
					</thead>
					<tbody>
						{enum_values(RecurrencyMode).map((mode) => (
							<tr key={mode}>
								<td>{RecurrencyMode[mode]}</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 !pr-0 text-right'>
									{(() => {
										const { lower, upper } = modes[mode]!
										return ((upper + lower) / 2).toCurrency()
									})()}
								</td>
								<td className='w-0 text-right'>
									(±
									{(() => {
										const { lower, upper } = modes[mode]!
										return ((upper - lower) / 2).toCurrency()
									})()}
									)
								</td>
								<td />
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal when={new_expense()} className='card' blur onDismiss={new_expense.off}>
				<RegisterOrEditExpense
					onSave={() => {
						new_expense.off()
						refetch()
						toast('success', 'Gasto agregado.')
					}}
				/>
			</Modal>

			<Modal when={edited_expense} onDismiss={() => edit(undefined)} className='card' blur>
				{(expense) => (
					<RegisterOrEditExpense
						expense={expense}
						onSave={() => {
							edit(undefined)
							refetch()
							toast('success', 'Gasto actualizado.')
						}}
					/>
				)}
			</Modal>

			<Modal when={working} blur>
				<Icon icon='spinner' pulse size='2x' />
			</Modal>
		</section>
	)
}

export default WithMainLayout(ExpensesPage, 'Gastos')

const RegisterOrEditExpense = (props: { expense?: inferQueryOutput<'expenses.all'>[number]; onSave?: () => void }) => {
	const {
		register: field,
		handleSubmit,
		watch: values,
		setValue: set,
	} = useForm<inferMutationInput<'expenses.add'> & { end: boolean }>({
		shouldUseNativeValidation: true,
		defaultValues: {
			...(props.expense ?? {}),
			date_start: props.expense?.date_start?.to_short() as any,
			date_end: props.expense?.date_end?.to_short() as any,
			end: props.expense?.date_end != null,
			repeats: props.expense?.repeats ?? RecurrencyMode.Mensual,
		},
	})

	const { mutate: register, isLoading: working_register } = trpc.useMutation(['expenses.add'], {
		onSuccess: props.onSave,
	})
	const { mutate: edit, isLoading: working_edit } = trpc.useMutation(['expenses.edit'], {
		onSuccess: props.onSave,
	})

	const working = working_register || working_edit

	return (
		<form onSubmit={handleSubmit((data) => (props.expense ? edit({ ...data, id: props.expense.id }) : register(data)))} className='grid grid-cols-2 gap-3'>
			<h1 className='font-medium text-lg'>Registrar gasto</h1>

			<div className='grid col-span-2'>
				<label htmlFor='name' className='label'>
					Nombre
				</label>
				<input {...field('name', { required: true, disabled: working })} id='name' type='text' className='input' />
			</div>

			<div className='grid col-span-2'>
				<label htmlFor='description' className='label'>
					Descripción
				</label>
				<input {...field('description', { disabled: working })} id='description' type='text' className='input' />
			</div>

			<div className='grid'>
				<label htmlFor='amount-from' className='label'>
					Monto desde:
				</label>
				<div className='input'>
					<span>RD$</span>
					<input
						{...field('lower_amount', {
							required: true,
							valueAsNumber: true,
							disabled: working,
							onChange: ({ target: { value } }) => set('upper_amount', Number(value)),
						})}
						id='lower_amount'
						type='number'
						className='text-right'
						placeholder='0'
						step='any'
					/>
				</div>
			</div>
			<div className='grid'>
				<label htmlFor='amount-to' className='label'>
					Monto hasta:
				</label>
				<div className='input'>
					<span>RD$</span>
					<input
						{...field('upper_amount', { valueAsNumber: true, disabled: working })}
						id='upper_amount'
						type='number'
						className='text-right'
						placeholder='0'
						step='any'
					/>
				</div>
			</div>

			<div className='flex flex-col'>
				<label htmlFor='date_start' className='label'>
					Desde:
				</label>
				<input
					{...field('date_start', { required: true, setValueAs: date, disabled: working })}
					type='date'
					id='date_start'
					className='input !flex-initial'
				/>
			</div>
			<div className='grid'>
				<label htmlFor='date_end' className='label'>
					Hasta:
				</label>
				<input {...field('date_end', { setValueAs: date, disabled: !values('end') || working })} type='date' id='date_end' className='input' />
				<div className='flex gap-2'>
					<input {...field('end', { setValueAs: date, disabled: working })} type='checkbox' id='end' />
					<label htmlFor='end'>Tiene fin</label>
				</div>
			</div>

			<div className='grid col-span-2'>
				<label htmlFor='repeats' className='label'>
					Recurrencia
				</label>
				<select {...field('repeats', { required: true, valueAsNumber: true, disabled: working })} id='repeats' className='input'>
					{enum_values(RecurrencyMode).map((i) => (
						<option key={i} value={i}>
							{RecurrencyMode[i]}
						</option>
					))}
				</select>
			</div>

			<div className='col-span-2 flex justify-end'>
				<button disabled={working} className='button'>
					{!working ? (
						<>
							Guardar <Icon icon='save' />
						</>
					) : (
						<>
							Guardando... <Icon icon='spinner' pulse />
						</>
					)}
				</button>
			</div>
		</form>
	)
}
