import React, { Component } from "react";

class CurrencyInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: Number(props.value ?? 0).toFixed(2)
		};
		this.input = React.createRef();

	}

	get value() { return Number(this.state.value); }

	onChange = (event) => {
		const value = Number(event.target.value ?? 0).toFixed(2);
		this.props.onChange?.(Number(value));
		this.setState({ value });
	};

	render = () => (
		<div 
			className={"border border-gray-400 rounded px-2 flex flex-row items-baseline w-max " + this.props.className} 
			onClick={() => this.input.current.focus()}>
			{ this.props.prefix? <span className="pr-2 text-gray-500">{this.props.prefix}</span> : null }
			<input 
				type="number" 
				ref={this.input} 
				value={this.state.value} 
				onChange={e => this.onChange(e)} 
				className="no-style min-w-0 max-w-full flex-1 text-right"/>
			{ this.props.suffix? <span className="pl-2 text-gray-500">{this.props.suffix}</span> : null }
		</div>
	);
}

export default CurrencyInput;