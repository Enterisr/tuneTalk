import React from 'react';
import './fuckyoureact.css';
import io from 'socket.io-client';
import autoBind from 'react-autobind';
import moment from 'moment';
import Sound from 'react-sound';
class Title extends React.Component {
	componentDidMount() {}
	render() {
		return <div id="title"> {this.props.value}</div>;
	}
}
class SendButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	sendMessage() {
		this.props.onClick();
	}
	render() {
		return (
			<button
				className={this.props.disabled ? 'activeButton' : 'passiveButton'}
				disabled={this.props.disabled ? '' : 'disabled'}
				onClick={() => this.sendMessage()}
			>
				{' '}
				send
			</button>
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
class Writer extends React.Component {
	messagesEndRef = React.createRef();

	constructor(props) {
		super(props);
		this.textInput = React.createRef();
		this.state = {};
		autoBind(this);
	}
	componentDidMount() {
		this.textInput.current.focus();
	}
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
				<SendButton
					disabled={this.props.disabled}
					onClick={() => this.sendMessageToBody(this.state.inputValue)}
				/>
			</div>
		);
		return Writer;
	}
}

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

class EntireChat extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: 'something sweet',
			chatLog: [],
			chatLogOwnerShip: [],
			servereq: 'none',
			socket: io('/my-namespace'),
			roomID: 'searching...',
			canWrite: false,
			backgroundURL: ' ',
			playAudio: 'STOPPED',
			style: {
				backgroundImage: "url('')" /*"url(" + this.state.backgroundURL + ")"*/
			},
			windowHasFocus: false
		};
		autoBind(this);
	}
	onFocus = () => {
		this.setState({ windowHasFocus: !this.state.windowHasFocus });
		if (this.state.windowHasFocus) {
			document.title = 'tuneTalk';
		}
	};

	componentWillUnmount() {
		window.removeEventListener('focus', this.onFocus);
	}
	componentWillUpdate() {}
	appendToTitle() {
		if (!this.state.windowHasFocus) {
			document.title.includes('new message!')
				? (document.title = document.title)
				: (document.title = 'new message!');
		} else {
			document.title = 'tuneTalk';
		}
	}
	componentDidMount() {
		window.addEventListener('focus', this.onFocus);
		this.state.socket.on('New message', (msg, time) => {
			this.AppendMessage(msg, time, false);
			this.appendToTitle();
			this.setState({ playAudio: 'PLAYING' });
		});
		this.state.socket.on('connect', () => {
			let url = new URL(window.location.href);
			let authToken = url.searchParams.get('access_token');
			this.state.socket.emit('auth', authToken);
		});
		this.state.socket.on('enteredRoom', (msg) => {
			this.setState({
				roomID: msg.roomID,
				canWrite: true,
				style: {
					backgroundImage: 'url("' + msg.backgroundImage.url + '")'
				}
			});
			fetch('/api/CoverArt', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/HTML'
				}
			})
				.then((data) => data.json())
				.then((URLobject) => {
					console.log(URLobject.backgroundURL.url);
					this.setState({
						style: {
							backgroundImage: 'url("' + URLobject.backgroundURL.url + '")'
						}
					});
				});
		});

		this.state.socket.on('roomEmpty', (msg) => {
			this.setState({
				roomID: 'looks like the other fellow left! there are plenty of fish in the sea :)',
				chatLog: [],
				chatLogOwnerShip: [],
				canWrite: false
			});
		});
	}

	PostMessage() {
		let message = this.state.inputValue;
		this.state.socket.emit('New message', message);
		console.log(message);
		this.AppendMessage(this.state.inputValue, moment().format('HH:mm:ss'), true);
	}

	SendMessage() {
		if (this.state.inputValue !== '') {
			this.PostMessage(this.state.chatLog.slice());
		}
	}
	AppendMessage(val, time, owner) {
		const chat = this.state.chatLog.slice();
		let WholeDiv = (
			<div>
				<div className="timeStyle">{time}</div>
				<div>{val}</div>
			</div>
		);
		chat.push(WholeDiv);
		const chatO = this.state.chatLogOwnerShip.slice();
		chatO.push(owner);
		this.setState({ chatLog: chat });
		this.setState({ chatLogOwnerShip: chatO });
		if (owner) this.ClearChat();
	}
	renderChatBody() {
		return <ChatBody chatLog={this.state.chatLog} chatLogOwnerShip={this.state.chatLogOwnerShip} />;
	}
	ClearChat() {
		this.setState({ inputValue: '' });
	}
	onTextEdit(inputValue) {
		this.setState({ inputValue: inputValue });
	}
	renderWriter() {
		return (
			<Writer
				inputValue={this.state.inputValue}
				onClick={this.SendMessage}
				onChange={this.onTextEdit}
				disabled={this.state.canWrite}
			/>
		);
	}

	HandleKeyPress(e) {
		if (e.key === 'Enter') {
			this.SendMessage();
		}
	}

	render() {
		return (
			<div id="reactWrap" style={this.state.style} onKeyPress={this.HandleKeyPress}>
				<Title value={this.state.roomID} />
				<Sound
					url="http://www.sounds.beachware.com/2illionzayp3may/jspjrz/BLOOP.mp3"
					playStatus={this.state.playAudio}
					onFinishedPlaying={() => {
						this.setState({ playAudio: 'STOPPED' });
					}}
				/>
				{this.renderChatBody()}
				{this.renderWriter()}
			</div>
		);
	}
}

export default EntireChat;
