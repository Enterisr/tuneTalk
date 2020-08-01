import React from 'react';
import './chat.css';
import io from 'socket.io-client';
import autoBind from 'react-autobind';
import moment, { duration } from 'moment';
import Sound from 'react-sound';
import ChatBody from '../ChatBody/ChatBody';
import cogoToast from 'cogo-toast';
import Title from '../Title/Title.js';
import Writer from '../Writer/Writer.js';
class EntireChat extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			inputValue: '',
			chatLog: [],
			chatLogOwnerShip: [],
			servereq: 'none',
			socket: io('/my-namespace'),
			roomID: '-1',
			canWrite: false,
			backgroundURL: ' ',
			isTheOtherUserTyping: false,
			playAudio: 'STOPPED',
			style: {
				backgroundImage: "url('')" /*"url(" + this.state.backgroundURL + ")"*/
			},
			windowHasFocus: false,
			chatState: 'roomEmpty'
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
			this.setState({
				roomID: msg.chatterNick,
				chatState: 'enteredRoom',
				canWrite: true,
				inputValue: 'You have a great taste!',
				style: {
					backgroundImage: 'url("' + msg.backgroundImage.url + '")'
				}
			});
		});
		//
		this.state.socket.on('typing', () => {
			this.setState({ isTheOtherUserTyping: true, chatState: 'typing' });
			this.timer = setTimeout(() => {
				this.setState({ isTheOtherUserTyping: false, chatState: 'enteredRoom' });
			}, 3000);
		});

		this.state.socket.on('roomEmpty', (msg) => {
			this.setState({
				roomID: '-1',
				chatState: 'roomEmpty',
				chatLog: [],
				chatLogOwnerShip: [],
				canWrite: false,
				inputValue: ''
			});
		});
		this.state.socket.on('noActualTaste', () => {
			cogoToast.error("we didn't caught your musical taste, so we picked one for you!  ❤️");
		});
	}

	PostMessage() {
		let message = this.state.inputValue;
		this.state.socket.emit('New message', message);
		this.AppendMessage(this.state.inputValue, moment().format('HH:mm:ss'), true);
	}

	SendMessage() {
		if (this.state.inputValue !== '') {
			this.PostMessage(this.state.chatLog.slice());
		}
	}
	AppendMessage(val, time, owner) {
		const chat = this.state.chatLog.slice();
		chat.push({ value: val, time: time });
		const chatO = this.state.chatLogOwnerShip.slice();
		chatO.push(owner);
		this.setState({ chatLog: chat, chatLogOwnerShip: chatO });
		if (owner) this.setState({ inputValue: '' });
	}

	onTextEdit(inputValue) {
		this.setState({ inputValue: inputValue });
		this.state.socket.emit('typing');
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
					chatState={this.state.chatState}
					otherUser={this.state.roomID}
				/>
				<Sound
					url="http://www.sounds.beachware.com/2illionzayp3may/jspjrz/BLOOP.mp3" //TODO: NOT GOOD!
					playStatus={this.state.playAudio}
					onFinishedPlaying={() => {
						this.setState({ playAudio: 'STOPPED' });
					}}
				/>
				<ChatBody chatLog={this.state.chatLog} chatLogOwnerShip={this.state.chatLogOwnerShip} />
				<Writer
					inputValue={this.state.inputValue}
					onClick={this.SendMessage}
					onChange={this.onTextEdit}
					disabled={this.state.canWrite}
				/>
			</div>
		);
	}
}

export default EntireChat;
