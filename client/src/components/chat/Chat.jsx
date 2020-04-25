import React from 'react';
import './fuckyoureact.css';
import io from 'socket.io-client';
import autoBind from 'react-autobind';
import moment, { duration } from 'moment';
import Sound from 'react-sound';
import ChatBody from '../ChatBody/ChatBody';
import { withRouter } from 'react-router-dom';
import { interval } from 'rxjs';
import cogoToast from 'cogo-toast';
function Title(props) {
	let val = props.value;
	if (val !== 'searching') return <div id="title"> {props.value}</div>;
	else {
		return (
			<div id="title">
				{' '}
				{props.value}
				<span
					style={{
						animation: 'text-pop-up-bottom .7s linear 1s  infinite both'
					}}
				>
					.
				</span>
				<span
					style={{
						animation: 'text-pop-up-bottom .7s  linear 2s infinite both'
					}}
				>
					.
				</span>
				<span
					style={{
						animation: 'text-pop-up-bottom .7s linear 3s infinite both'
					}}
				>
					.
				</span>
			</div>
		);
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
				<SendButton
					disabled={this.props.disabled}
					onClick={() => this.sendMessageToBody(this.state.inputValue)}
				/>
			</div>
		);
		return Writer;
	}
}

class EntireChat extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			inputValue: 'something sweet',
			chatLog: [],
			chatLogOwnerShip: [],
			servereq: 'none',
			socket: io('/my-namespace'),
			roomID: 'searching',
			canWrite: false,
			backgroundURL: ' ',
			isTheOtherUserTyping: false,
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
		this.state.socket.on('disconnect', () => {
			this.props.history.push('/');
		});
		this.state.socket.on('enteredRoom', (msg) => {
			alert(msg.chatterNick);
			this.setState({
				roomID: msg.chatterNick,
				canWrite: true,
				style: {
					backgroundImage: 'url("' + msg.backgroundImage.url + '")'
				}
			});
		});
		this.state.socket.on('typing', () => {
			this.setState({ isTheOtherUserTyping: true });
			this.timer = setTimeout(() => {
				this.setState({ isTheOtherUserTyping: false });
			}, 3000);
		});

		this.state.socket.on('roomEmpty', (msg) => {
			this.setState({
				roomID: 'looks like the other fellow left! there are plenty of fish in the sea :)',
				chatLog: [],
				chatLogOwnerShip: [],
				canWrite: false
			});
		});
		this.state.socket.on('noActualTaste', () => {
			cogoToast.error("we didn't caught your musical taste, so we picked one for you!  ❤️");
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
		/* Let WholeDiv = (
			<div>
				<div className="timeStyle">{time}</div>
				<div>{val}</div>
			</div>
		); */
		chat.push({ value: val, time: time });
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
		this.state.socket.emit('typing');
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
				<Title
					value={this.state.isTheOtherUserTyping ? this.state.roomID + ' is typing...' : this.state.roomID}
				/>
				<Sound
					url="http://www.sounds.beachware.com/2illionzayp3may/jspjrz/BLOOP.mp3" //TODO: NOT GOOD!
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
