import './styles/transactions.css';
import { date_to_day, format_currency } from './utilities';

const Transactions = (props) => (
	<div className="transactions">
		<table>
			<thead>
				<th>Día</th>
				<th>Concepto</th>
				<th>Detalles</th>
				<th colSpan={2}>Monto</th>
				<th>Tags</th>
				<th></th>
			</thead>
			<tbody>
				{props.source.map((t, i) =>
					<tr key={i}>
						<td className="text-right">{date_to_day(t.date)}</td>
						<td>{t.concept}</td>
						<td>{t.details}</td>
						<td className="!pr-0">RD$</td>
						<td className="text-right font-mono">{format_currency(t.amount)}</td>
						<td>{t.tags.sort((a, b) => a > b? 1 : -1).join(', ')}</td>
						<td><button></button></td>
					</tr>)}
			</tbody>
		</table>
	</div>
);

export default Transactions;