import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Transaction } from './types';
import { date_to_day, format_currency } from './utils/utilities';

import './styles/transactions.css';

interface TransactionsProperties {
	source: Transaction[];
	editing?: Transaction | null;
	over?: string | null;
	onEdit?: (transaction: Transaction) => void;
	onRemove?: (transaction: Transaction) => void;
	onTagHover?: (tag: string | null) => void;

	className?: string
}

const Transactions = (props: TransactionsProperties) => (
	<div className={ ["transactions", props.className].join(' ') }>
		<table>
			<thead>
				<tr>
					<th>Día</th>
					<th>Concepto</th>
					<th>Detalles</th>
					<th colSpan={3}>Monto</th>
					<th>Tags</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{props.source.sort_by(t => t.date, false).map((t, i) =>
					<tr key={i} className={ [
						"group", 
						(t == props.editing? "editing" : ''),
						(t.amount < 0? "income" : ''),
						((t.tags.includes(props.over as string) || t.date == props.over)? 'over' : '')].join(' ') }>
						<td className="text-right">
							<div className="min-w-max">{date_to_day(t.date)}</div>
						</td>
						<td>{t.concept}</td>
						<td>{t.details}</td>
						<td className="w-0">RD$</td>
						<td className="w-0 text-right font-mono">
							<div className="min-w-max">{format_currency(t.amount)}</div>
						</td>
						<td></td>
						<td>
							<div className="min-w-max">
								{t.tags.sort().map(tag =>
								<span 
								key={tag}
								className='tag'
								onMouseOver={() => props.onTagHover?.(tag)}
								onMouseOut={() => props.onTagHover?.(null)}>
									{tag}
								</span> )}
							</div>
						</td>
						<td className="action-icons w-0">
							{ t !== props.editing? 
							<div className="flex flex-row items-center">
								<button onClick={() => props.onEdit?.(t)} title="Editar" className="invisible group-hover:visible">
									<FontAwesomeIcon icon={['far', 'edit']}/>
								</button>
								<button onClick={() => props.onRemove?.(t)} title="Remover" className="invisible group-hover:visible">
									<FontAwesomeIcon icon={['far', 'trash-alt']}/>
								</button>
							</div> :
							<FontAwesomeIcon icon="pen-clip" title="Editando..."/> }
						</td>
					</tr>)}
			</tbody>
		</table>
	</div>
);

export default Transactions;