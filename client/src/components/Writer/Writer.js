import React from 'react';
import autoBind from 'react-autobind';
class Writer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		autoBind(this);
	}
	componentDidMount() {}
	sendMessageToBody(msg) {
		this.props.onClick(msg);
	}

	updateInputValue(evt) {
		const text = evt.target.value;
		this.props.onChange(text);
	}
	render() {
		let Writer = (
			<div id="Writer">
				<input
					ref={this.textInput}
					autoFocus={true}
					disabled={this.props.disabled ? '' : 'disabled'}
					value={this.props.inputValue}
					id="inputSpan"
					type="text"
					onChange={(evt) => this.updateInputValue(evt)}
				/>

				<button
					className={this.props.disabled ? 'activeButton' : 'passiveButton'}
					disabled={this.props.disabled ? '' : 'disabled'}
					onClick={() => this.sendMessageToBody(this.state.inputValue)}
				>
					{' '}
					send
				</button>
			</div>
		);
		return Writer;
	}
}
export default Writer;
