import React from 'react';
import './ChatBody.css';
import autoBind from 'react-autobind';
import { renderToString } from 'react-dom/server';

class ChatBody extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.messagesEndRef = React.createRef();
		autoBind(this);
	}
	scrollToBottom = () => {
		this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	renderMessage(messageVal, time, key, Author) {
		return <Message val={messageVal} time={time} key={key} IsAuthor={Author} />;
	}
	componentDidUpdate() {
		this.scrollToBottom();
	}
	renderMessages() {
		let Messages = [];
		for (let i = 0; i < this.props.chatLog.length; i++) {
			Messages.push(
				this.renderMessage(
					this.props.chatLog[i].value,
					this.props.chatLog[i].time,
					i,
					this.props.chatLogOwnerShip[i]
				)
			);
		}
		return Messages;
	}

	render() {
		return (
			<React.Fragment>
				<div id="ChatBody">
					{this.renderMessages()}
					<div ref={this.messagesEndRef} />
				</div>
			</React.Fragment>
		);
	}
}
class Message extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reacived: '',
			style: 'none',
			isLink: false,
			isBold: false,
			msgAfterEffects: <span />
		};
		autoBind(this);
		//    this.style = (this.props.IsAuthor ? "MyMessageStyle" : "OtherMessageStyle");
	}
	renderMsgToString() {
		return renderToString(this.state.msgAfterEffects);
	}
	componentDidMount() {
		this.setState({ msgAfterEffects: this.props.val });
		this.isMessageLink(this.props.val) ? this.setState({ isLink: true }) : this.setState({ isLink: false });
		this.ApplyTextStyle('*', 'bold');
		//	let jsxMsgAsString = renderToString();
		//	this.ApplyTextStyle('_', 'italic', jsxMsgAsString); //TODO: this is cancels the bolding because it restarts the props,
	}
	isMessageLink(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}
	ApplyTextStyle(char, effect, remainingString = this.props.val, boldedRecElm) {
		let idx = remainingString.indexOf(char);
		if (idx != -1) {
			let idxCloser = remainingString.indexOf(char, idx + 1);
			let boldedWithBefore = '';
			if (idxCloser != -1) {
				let beforeBoldPart = remainingString.slice(0, idx);
				let boldPart = remainingString.slice(idx, idxCloser);
				let boldPartWithoutAstr = boldPart.slice(1, boldPart.length);
				remainingString = remainingString.slice(idxCloser + 1);
				let boldElm = { boldPartWithoutAstr };
				if (effect === 'bold') {
					boldElm = <b>{boldPartWithoutAstr}</b>;
				} else if (effect === 'italic') {
					boldElm = <i>{boldPartWithoutAstr}</i>;
				}
				boldedWithBefore = (
					<span>
						{beforeBoldPart}
						{boldElm}
					</span>
				);
				boldedRecElm = (
					<React.Fragment>
						{boldedRecElm}
						{boldedWithBefore}
					</React.Fragment>
				);
				{
					this.ApplyTextStyle(char, effect, remainingString, boldedRecElm);
				}
			}
		} else {
			//stop
			let elm = (
				<span>
					{boldedRecElm}
					{remainingString}
				</span>
			);
			this.setState({ msgAfterEffects: elm });
		}
		//TODO: START OVER THIS SHITE;
	}
	render() {
		let value = this.props.val;
		let msg = this.state.isLink ? (
			<a target="_blank" href={value}>
				{value}
			</a>
		) : (
			<div>{value}</div>
		);
		return (
			<div className={this.props.IsAuthor ? 'MyMessageStyle' : 'OtherMessageStyle'}>
				<div className="timeStyle">{this.props.time}</div>
				{this.state.msgAfterEffects}
			</div>
		);
	}
}

export default ChatBody;
