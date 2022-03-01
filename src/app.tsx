import React from 'react';
import CurrencyInput from './inputs/currency-input';
import Transactions from './transactions';
import TagsInput from './inputs/tags-input';
import DailySummary from './daily-summary';
import TagSummary from './tag-summary';
import MonthSidebar from './month-sidebar';

import { date_to_day, export_text_file, format_currency, sum } from './utils/utilities';
import { Period, period_to_string, Transaction } from './types';

import './styles/app.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function date_to_iso(date: Date | string | number) {
	if (typeof date === 'string')
		date = new Date(date + 'T00:00:00');
	else
		date = new Date(date);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface AppState {
	transactions: Transaction[];
	editing: Transaction | null;
	active_period: Period | null;
	over: string | null;
	date: Date | string;
	concept: string;
	details: string;
	amount: number;
	tags: string[]
}

class App extends React.Component<{}, AppState> {
	constructor(props: {}) {
		super(props);
		const saved_transactions = JSON.parse(localStorage.getItem('transactions') ?? '[]');
		const periods = this.periods(saved_transactions).sort_by(p => `${p.year}${p.month.toString().padStart(2, '0')}`);
		this.state = {
			transactions: saved_transactions,
			editing: null,
			active_period: periods[periods.length - 1],
			over: null,
			date: date_to_iso(Date.now()),
			concept: '',
			details: '',
			amount: 0,
			tags: []
		};
	}

	add_transaction(is_expense = true) {
		const transaction = {
			date: this.state.date,
			concept: this.state.concept?.trim(),
			details: this.state.details?.trim(),
			amount: is_expense? this.state.amount : -this.state.amount,
			tags: this.state.tags
		};
		if (['date', 'concept', 'amount'].some(key => !(transaction as any)[key]))
			return;
		if (!this.state.editing) {
			const transactions = this.state.transactions.concat(transaction);
			localStorage.setItem('transactions', JSON.stringify(transactions));
			this.setState({ transactions, concept: '', details: '', amount: 0, tags: [] });
		} else {
			const index = this.state.transactions.indexOf(this.state.editing);
			const transactions = this.state.transactions.slice();
			transactions[index] = transaction;
			localStorage.setItem('transactions', JSON.stringify(transactions));

			this.setState({ transactions })
			this.cancel_editing();
		}
	}

	begin_editing(transaction: Transaction) {
		this.setState({
			editing: transaction,
			date: transaction.date, 
			concept: transaction.concept,
			details: transaction.details, 
			amount: Math.abs(transaction.amount), 
			tags: transaction.tags
		});
	}
	
	cancel_editing() {
		this.setState({editing: null, concept: '', details: '', amount: 0, tags: [] })
	}

	remove(transaction: Transaction) {
		const transactions = this.state.transactions.filter(t => t !== transaction);
		localStorage.setItem('transactions', JSON.stringify(transactions));
		this.setState({transactions});
	}

	periods(transactions: Transaction[]): { month: number; year: number; }[] {
		return transactions.map(t => {
			const date = new Date(t.date + 'T00:00:00');
			return { month: date.getMonth(), year: date.getFullYear() };
		}).distinct(p => `${p.year}${p.month}`);
	}

	get period_transactions(): Transaction[] {
		const period = this.state.active_period;
		return this.state.transactions.filter(t => {
			const date = new Date(t.date + 'T00:00:00');
			return date.getFullYear() == period?.year && date.getMonth() == period?.month;
		})
	}

	export_transactions_as_csv() {
		const now = new Date(Date.now());
		const headers = ['Date', 'Concept', 'Details', 'Amount', 'Tags'];
		const transactions = this.state.transactions.map(t => 
			[t.date, t.concept, t.details.replace(/\n/g, '\\n').replace(/,/g, '{;}'), t.amount.toFixed(2), t.tags.join('{;}')]
		);
		export_text_file(`transactions ${date_to_iso(now)}.csv`, [headers].concat(transactions as any).map(r => r.join(',')).join('\n'));
	}

	render() {
		const expenses = sum(this.period_transactions.filter(t => t.amount >= 0).map(t => t.amount));
		const income = -sum(this.period_transactions.filter(t => t.amount < 0).map(t => t.amount));
		return (<>
			<MonthSidebar 
			periods={this.periods(this.state.transactions)} 
			active={this.state.active_period} 
			onPeriodChange={period => this.setState({active_period: period})}/>

			<div className="content">
				<div className="flex flex-row justify-between items-center">
					<h1 className="title">Finn</h1>
					<button onClick={() => this.export_transactions_as_csv()} className="border rounded-lg px-2 py-1 border-neutral-500 space-x-2">
						<span>Exportar</span>
						<FontAwesomeIcon icon="file-csv"/>
					</button>
				</div>
				<h2 className="period">{period_to_string(this.state.active_period)}</h2>
				
				<div className="flex-1 flex flex-row items-stretch">
					<div className="flex-1 mr-1 flex flex-col">
						<Transactions
						className="flex-1"
						source={this.period_transactions} 
						editing={this.state.editing} 
						over={this.state.over}
						onEdit={t => this.begin_editing(t)}
						onRemove={t => this.remove(t)}
						onTagHover={over => this.setState({over})}/>

						<div className="totals">
							<div>Gastos: {format_currency(expenses, 'RD$ ')}</div>
							<div>Ingresos: {format_currency(income, 'RD$ ')}</div>
							<div>Neto: {format_currency(income - expenses, 'RD$ ')}</div>
						</div>

						<div className="new-transaction mt-8 pt-8 border-t">
							<table>
								<tbody>
									<tr>
										<td>Día:</td>
										<td className="space-x-3">
											<input value={this.state.date.toString()} onChange={e => this.setState({ date: e.target.value })} type="date" />
											<span>{date_to_day(this.state.date)}</span>
										</td>
									</tr>
									<tr>
										<td>Concepto:</td>
										<td><input value={this.state.concept} onChange={e => this.setState({ concept: e.target.value })} type="text" className="w-full" /></td>
									</tr>
									<tr>
										<td>Detalles:</td>
										<td><textarea value={this.state.details} onChange={e => this.setState({ details: e.target.value })} className="w-full" /></td>
									</tr>
									<tr>
										<td>Monto:</td>
										<td><CurrencyInput value={this.state.amount} onChange={value => this.setState({ amount: value })} prefix="RD$" className="w-full max-w-[150px]" /></td>
									</tr>
									<tr>
										<td>Tags:</td>
										<td>
											<TagsInput tags={this.state.tags} onUpdate={tags => this.setState({tags})} />
										</td>
									</tr>
								</tbody>
							</table>
							<div className="submit">
								<button onClick={() => this.add_transaction(true)} className="expense">
									Gasto
								</button>
								<button onClick={() => this.add_transaction(false)} className="income">
									Ingreso
								</button>
								{this.state.editing?
								<button onClick={() => this.cancel_editing()} className="cancel">
									Cancelar
								</button> : null}
							</div>
						</div>
					</div>

					<DailySummary 
					className="mx-1" 
					transactions={this.period_transactions} 
					over={this.state.over}
					onDateHover={over => this.setState({over})}/>

					<TagSummary 
					className="ml-1" 
					transactions={this.period_transactions}
					over={this.state.over}
					onTagHover={over => this.setState({over})}/>
				</div>
			</div>
		</>);
	}
}

export default App;
