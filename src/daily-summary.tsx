import { Transaction } from './types';
import { sum, format_currency, date_to_day } from './utils/utilities';

import './styles/daily-summary.css';

interface DailySummayrProperties {
	transactions: Transaction[];
	className?: string;
	over?: string | null;
	onDateHover?: (date: string | null) => void;
}

const DailySummary = (props: DailySummayrProperties) => (
	<div className={ ["daily", props.className].join(' ') }>
		<table>
			<thead>
				<tr>
					<th>Día</th>
					<th colSpan={2}>Gasto</th>
				</tr>
			</thead>
			<tbody>
				{props.transactions.group(t => t.date).sort_by(({key}) => key).map(({key, items}) => 
					<tr 
					key={key as string} 
					className={ [props.over == key? 'over' : ''].join(' ') }
					onMouseOver={() => props.onDateHover?.(key as string)}
					onMouseOut={() => props.onDateHover?.(null)}>
						<td className="text-right px-2">
							<div className="min-w-max">{date_to_day(key)}</div>
						</td>
						<td className="pl-2">RD$ </td>
						<td className="text-right font-mono px-2">{format_currency(sum(items.map(i => i.amount).filter(a => a >= 0)))}</td>
					</tr>	
				)}
			</tbody>
		</table>
	</div>
);

export default DailySummary;