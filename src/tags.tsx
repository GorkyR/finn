const Tags = (props) => (
	<div className={ [props.className, "border border-gray-400 rounded-md p-2"].join(' ') }>
		<table>
			<thead className="border-b border-gray-400">
				<th>Tag</th>
				<th>Monto</th>
				<th>Porcentaje</th>
			</thead>
			<tbody>
				{props.transactions
					.map(transaction => transaction.tags.map(tag => ({ tag, transaction })))}
			</tbody>
		</table>
	</div>
);

export default Tags;