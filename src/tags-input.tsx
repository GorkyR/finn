import React from "react";

class TagsInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: '' };
	}

	add_tag(event) {
		if (event.key === 'Enter' && this.props.update && this.state.value) {
			this.props.update(this.props.tags.concat(this.state.value?.trim()));
			this.setState({value: ''})
			event.preventDefault();
		}
	}

	remove_tag(index) {
		if (this.props.update) {
			const tags = this.props.tags.slice();
			tags.splice(index, 1);
			this.props.update(tags);
		}
	}

	render() {
		return (
			<div className="border border-gray-400 rounded px-2 py-px flex flex-row flex-wrap">
				{this.props.tags?.map((tag, i) => 
					<div className="bg-gray-400 rounded px-1 text-white mr-1 flex flex-row items-baseline">
						<div className="mr-1 hover:text-red-500 cursor-pointer text-sm"
						onClick={() => this.remove_tag(i)}>✖</div>
						{tag}
					</div> 
				)}
				<input type="text" className="no-style flex-1"
				value={this.state.value} 
				onChange={e => this.setState({ value: e.target.value })} 
				onKeyDown={e => this.add_tag(e)}/>
			</div>
		);
	}
}

export default TagsInput;