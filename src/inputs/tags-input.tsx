import React from "react";

interface TagsInputProperties {
	tags: string[];
	onUpdate: (tags: string[]) => void;
}

class TagsInput extends React.Component<TagsInputProperties, { value: string }> {
	constructor(props: TagsInputProperties) {
		super(props);
		this.state = { value: '' };
	}

	handle_interaction(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter' && this.props.onUpdate && this.state.value) {
			this.props.onUpdate(this.props.tags.concat(this.state.value?.trim()));
			this.setState({value: ''})
			event.preventDefault();
		}
		if (event.key === 'Backspace' && !this.state.value?.trim() && (event.target as HTMLInputElement).selectionStart == 0) {
			this.remove_tag(this.props.tags.length - 1);
			this.setState({ value: '' });
		}
	}

	remove_tag(index: number) {
		if (this.props.onUpdate) {
			const tags = this.props.tags.slice();
			tags.splice(index, 1);
			this.props.onUpdate(tags);
		}
	}

	render() {
		return (
			<div className="border border-gray-400 rounded px-2 py-px flex flex-row flex-wrap">
				{this.props.tags?.map((tag, i) => 
					<div key={tag} className="bg-gray-400 rounded px-1 text-white mr-1 flex flex-row items-baseline">
						<div className="mr-1 hover:text-red-500 cursor-pointer text-sm"
						onClick={() => this.remove_tag(i)}>✖</div>
						{tag}
					</div> 
				)}
				<input type="text" className="no-style flex-1"
				value={this.state.value} 
				onChange={e => this.setState({ value: e.target.value })} 
				onKeyDown={e => this.handle_interaction(e)}/>
			</div>
		);
	}
}

export default TagsInput;