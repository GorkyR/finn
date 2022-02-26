import React from 'react';
import CurrencyInput from './currency-input';
import Transactions from './transactions';
import TagsInput from './tags-input';
import Daily from './daily';

import './styles/app.css';
import { date_to_day } from './utilities';
import Tags from './tags';

function date_to_iso(date) {
	if (typeof date === 'string')
		date = new Date(date + 'T00:00:00');
	else
		date = new Date(date);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			transactions: [
				{
					date: '2022-02-21',
					concept: 'Pastelito Factory',
					details: 'Pastelitos',
					amount: 109.50,
					tags: ['food', 'work', 'fluff']
				},
				{
					date: '2022-02-22',
					concept: "Wendy's",
					details: 'Breakfast Baconator',
					amount: 300.00,
					tags: ['food', 'work', 'fluff']
				}
			],

			date: date_to_iso(Date.now()),
			concept: null,
			details: null,
			amount: null,
			tags: []
		};
	}

	add_transaction(is_expense = true) {
		this.setState({ 
			transactions: this.state.transactions.concat({
				date: this.state.date,
				concept: this.state.concept,
				details: this.state.details,
				amount: is_expense? this.state.amount : -this.state.amount,
				tags: this.state.tags
			}),
			date: date_to_iso(Date.now()),
			concept: '',
			details: '',
			amount: 0,
			tags: []
		});
	}

	render() {
		return (
			<div className="p-4">
				<h1 className="title">Fidd</h1>
				<div className="flex flex-row">
					<div className="mr-1">
						<Transactions source={this.state.transactions}/>

						<div className="new-transaction mt-8">
							<table>
								<tr>
									<td>Día:</td>
									<td className="space-x-3">
										<input value={this.state.date} onChange={e => this.setState({ date: e.target.value })} type="date" />
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
										<TagsInput tags={this.state.tags} update={tags => this.setState({tags})} />
									</td>
								</tr>
							</table>
							<div className="flex flex-row">
								<button onClick={() => this.add_transaction(true)} className="submit spend">
									Gasto
								</button>
								<button onClick={() => this.add_transaction(false)} className="submit income">
									Ingreso
								</button>
							</div>
						</div>
					</div>
					<Daily className="mx-1" transactions={this.state.transactions} />
					<Tags className="ml-1" />
				</div>
			</div>
		);
	}
}

export default App;
