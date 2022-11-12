import { useForm } from 'react-hook-form'
import Icon from '../components/icon'
import Modal from '../components/modal'
import { useToast } from '../components/toaster/toaster'
import { RecurrencyMode } from '../enums/recurrency-modes.enum'
import { sum } from '../utils/array.utils'
import { date, format_date, today } from '../utils/date.utils'
import { enum_values } from '../utils/enum.utils'
import { useField } from '../utils/field.hook'
import useToggle from '../utils/toggle.hook'
import { inferMutationInput, inferQueryOutput, trpc } from '../utils/trpc'
import { WithMainLayout } from './_app'

const IncomePage = () => {
	const { data: income, isLoading: loading_income, refetch } = trpc.useQuery(['income.all'])
	const new_income = useToggle()
	const toast = useToast()

	const { props: hpy_field, value: hpy, set: set_hpy } = useField(0)
	const { props: hpd_field, value: hpd, set: set_hpd } = useField(0)

	const {
		data: hours_per_year,
		isLoading: loading_hours_year,
		refetch: refetch_hours_year,
	} = trpc.useQuery(['income.hours-per-year'], {
		onSuccess: set_hpy,
	})
	const {
		data: hours_per_day,
		isLoading: loading_hours_day,
		refetch: refetch_hours_day,
	} = trpc.useQuery(['income.hours-per-day'], {
		onSuccess: set_hpd,
	})

	const { mutate: edit_hours_year, isLoading: working_hours_year } = trpc.useMutation(['income.edit-hours-per-year'], {
		onSuccess: () => {
			toast('success', 'Horas actualizadas.')
			refetch_hours_year()
		},
	})

	const { mutate: edit_hours_day, isLoading: working_hours_day } = trpc.useMutation(['income.edit-hours-per-day'], {
		onSuccess: () => {
			toast('success', 'Horas actualizadas.')
			refetch_hours_day()
		},
	})

	const loading = loading_income || loading_hours_year || loading_hours_day
	const working = working_hours_year || working_hours_day

	if (loading || !income || hours_per_year == null) return <Icon icon='spinner' pulse size='2x' />

	const modes = enum_values(RecurrencyMode).reduce((o, r) => {
		const i = income.filter((e) => e.repeats == r && e.date_start < today() && !e.expired).map((e) => e.amount)
		return { ...o, [r]: sum(i) }
	}, {} as { [key: number]: number })

	const annual = modes[RecurrencyMode.Anual]! + modes[RecurrencyMode.Mensual]! * 12 + modes[RecurrencyMode.Semanal]! * 52 + modes[RecurrencyMode.Diario]! * 365

	return (
		<section className='container mx-auto p-2'>
			<button onClick={new_income.on} className='button mb-4'>
				Nuevo ingreso
			</button>

			<div className='flex gap-4 items-start'>
				<table className='table'>
					<thead>
						<tr>
							<th>Descripción</th>
							<th colSpan={3}>Monto</th>
							<th>Recurrencia</th>
							<th>Desde</th>
							<th>Hasta</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{income.map((i) => (
							<tr key={i.id}>
								<td>{i.description}</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 text-right'>{i.amount.toCurrency()}</td>
								<td />
								<td>{RecurrencyMode[i.repeats]}</td>
								<td>{format_date(i.date_start)}</td>
								<td>{i.date_end ? format_date(i.date_end) : 'Presente'}</td>
								<td>
									<div className='flex gap-2'>
										<button className='button'>
											<Icon icon='edit' />
										</button>
										<button className='button'>
											<Icon icon={['far', 'trash-alt']} />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<div className='flex flex-col gap-4'>
					<table className='table'>
						<thead>
							<tr>
								<th colSpan={1 + 3} className='text-center'>
									Ingresos
								</th>
							</tr>
							<tr>
								<th>Por</th>
								<th colSpan={3}>Monto</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Año</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 text-right'>{annual.toCurrency()}</td>
								<td />
							</tr>
							<tr>
								<td>Mes</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 text-right'>~{(annual / 12).toCurrency()}</td>
								<td />
							</tr>
							<tr>
								<td>Día</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 text-right'>
									{hours_per_year && hours_per_day ? '~' + ((annual / hours_per_year) * hours_per_day).toCurrency() : '–'}
								</td>
								<td />
							</tr>
							<tr>
								<td>Hora</td>
								<td className='w-0 !pr-0'>RD$</td>
								<td className='w-0 text-right'>{hours_per_year ? '~' + (annual / hours_per_year).toCurrency() : '–'}</td>
								<td />
							</tr>
						</tbody>
					</table>

					<div>
						<label htmlFor='hours' className='label'>
							Horas de trabajo anuales
						</label>
						<div className='flex gap-2'>
							<input {...hpy_field} type='number' id='hours' className='input text-right' placeholder='0' />
							<button onClick={() => edit_hours_year(hpy || 0)} className='button'>
								<Icon icon='save' />
							</button>
						</div>
					</div>

					<div>
						<label htmlFor='hours' className='label'>
							Horas de trabajo diarias
						</label>
						<div className='flex gap-2'>
							<input {...hpd_field} type='number' id='hours' className='input text-right' placeholder='0' />
							<button onClick={() => edit_hours_day(hpd || 0)} className='button'>
								<Icon icon='save' />
							</button>
						</div>
					</div>
				</div>
			</div>

			<Modal when={new_income()} onDismiss={new_income.off} blur className='card'>
				<AddOrEditIncome
					onSave={() => {
						new_income.off()
						refetch()
						toast('success', 'Ingreso creado.')
					}}
				/>
			</Modal>
		</section>
	)
}

export default WithMainLayout(IncomePage, 'Ingresos')

const AddOrEditIncome = (props: { income?: inferQueryOutput<'income.all'>[number]; onSave?: () => void }) => {
	const {
		register: field,
		handleSubmit,
		watch: values,
	} = useForm<inferMutationInput<'income.add'> & { end: boolean }>({
		shouldUseNativeValidation: true,
		defaultValues: {
			repeats: RecurrencyMode.Mensual,
		},
	})

	const { mutate: add, isLoading: working_register } = trpc.useMutation(['income.add'], {
		onSuccess: props.onSave,
	})

	const working = working_register

	return (
		<form onSubmit={handleSubmit((data) => add(data))} className='grid grid-cols-2 gap-2'>
			<h2 className='font-medium text-lg col-span-2'>Registrar ingreso</h2>

			<div>
				<label htmlFor='description' className='label'>
					Descripción
				</label>
				<input {...field('description', { required: true, disabled: working })} type='text' id='description' className='input' />
			</div>

			<div>
				<label htmlFor='amount' className='label'>
					Monto
				</label>
				<div className='input'>
					<span>RD$</span>
					<input
						{...field('amount', { required: true, valueAsNumber: true, min: 0, disabled: working })}
						type='number'
						id='amount'
						className='text-right'
						step='any'
						placeholder='0'
						min={0}
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
