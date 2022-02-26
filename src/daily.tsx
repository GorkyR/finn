import { group, sum, format_currency, date_to_day } from './utilities';

const Daily = (props) => (
	<div className={ ["border border-gray-400 rounded-md p-2", props.className].join(' ') }>
		<table>
			<thead className="border-b border-gray-400">
				<th>Día</th>
				<th colSpan={2}>Gasto</th>
			</thead>
			<tbody>
				{group(props.transactions, t => t.date).map(group => 
					<tr className="even:bg-gray-200">
						<td className="text-right px-2">{date_to_day(group.key)}</td>
						<td className="pl-2">RD$ </td>
						<td className="text-right font-mono px-2">{format_currency(sum(group.items.map(i => i.amount)))}</td>
					</tr>	
				)}
			</tbody>
		</table>
	</div>
);

export default Daily;