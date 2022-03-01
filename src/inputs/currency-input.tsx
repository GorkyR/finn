import React from "react";

interface CurrencyInputProperties {
	className?: string;
	value: number | string;
	prefix?: string;
	suffix?: string;
	onChange: (value: number) => void;
}

class CurrencyInput extends React.Component<CurrencyInputProperties> {
	input: React.RefObject<HTMLInputElement>;

	constructor(props: CurrencyInputProperties) {
		super(props);
		this.input = React.createRef<HTMLInputElement>();
		if (props.value < 0) {
			props.onChange?.(0);
			// throw "Minimum value of currency is 0.";
		}
	}

	update(event: React.ChangeEvent<HTMLInputElement>) {
		this.props.onChange?.(Math.max(Number((event.target as HTMLInputElement).value ?? 0), 0));
	};

	render() { 
		return (
			<div 
			className={"border border-gray-400 rounded px-2 flex flex-row items-baseline w-max " + this.props.className} 
			onClick={() => this.input.current?.focus()}>
				{ this.props.prefix? <span className="pr-2 text-gray-500">{this.props.prefix}</span> : null }
				<input 
				type="number" 
				ref={this.input} 
				value={Number(this.props.value)}
				onChange={e => this.update(e)} 
				className="no-style min-w-0 max-w-full flex-1 text-right"/>
				{ this.props.suffix? <span className="pl-2 text-gray-500">{this.props.suffix}</span> : null }
			</div>
		)
	};
}

export default CurrencyInput;