import { Transaction } from "./types";
import { format_currency, sum } from "./utils/utilities";

import './styles/tag-summary.css';

interface TagSummaryProperties {
	transactions: Transaction[];
	className?: string;
	over?: string | null;
	onTagHover?: (tag: string | null) => void;
}

function TagSummary(props: TagSummaryProperties) {
	const total_expenses = sum(props.transactions.filter(t => t.amount >= 0).map(t => t.amount));

	return (
		<div className={ ["tags", props.className].join(' ') }>
			<table>
				<thead>
					<tr>
						<th>Tag</th>
						<th colSpan={3}>Gastos</th>
						<th>Porcentaje</th>
					</tr>
				</thead>
				<tbody>
					{ props.transactions.categorize(t => t.tags)
						.map(({ key: tag, items: transactions }) => ({ tag, expenses: sum(transactions.map(t => t.amount).filter(a => a >= 0)) }))
						.sort_by(({tag}) => tag)
						.sort_by(({expenses}) => expenses, true)
						.map(({tag, expenses}) => (
							<tr 
							key={tag} 
							className={tag == props.over? 'over' : ''}
							onMouseOver={() => props.onTagHover?.(tag)}
							onMouseOut={() => props.onTagHover?.(null)}>
								<td>{tag}</td>
								<td className="w-0">RD$ </td>
								<td className="w-0 text-right font-mono">{format_currency(expenses)}</td>
								<td></td>
								<td className="percentage">
									<div className="bar" style={{width: `max(${expenses/total_expenses*100}%, 0px)`}}/>
									<div>{(expenses/total_expenses*100).toFixed(1)}%</div>
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	)
};

export default TagSummary;