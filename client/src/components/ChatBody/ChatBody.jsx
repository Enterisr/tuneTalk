import React from 'react';
import './ChatBody.css';
import autoBind from 'react-autobind';
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
	renderMessage(messageVal, key, Author) {
		return <Message val={messageVal} key={key} IsAuthor={Author} />;
	}
	componentDidUpdate() {
		this.scrollToBottom();
	}
	renderMessages() {
		let Messages = [];
		for (let i = 0; i < this.props.chatLog.length; i++) {
			Messages.push(this.renderMessage(this.props.chatLog[i], i, this.props.chatLogOwnerShip[i]));
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
			style: 'none'
		};
		autoBind(this);
		//    this.style = (this.props.IsAuthor ? "MyMessageStyle" : "OtherMessageStyle");
	}
	render() {
		return <div className={this.props.IsAuthor ? 'MyMessageStyle' : 'OtherMessageStyle'}>{this.props.val}</div>;
	}
}

export default ChatBody;
