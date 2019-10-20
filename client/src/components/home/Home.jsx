import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Redirect } from 'react-router-dom';
import style from './home.css';

import image from './firstime.jpeg';

class Home extends React.Component {
	constructor(props) {
		super(props);
		let href = window.location.href.includes(':3000')
			? `http://${window.location.hostname}:5000/newHere`
			: `https://${window.location.hostname}/newHere`;
		this.state = {
			rightHref: href,
			nickName: null,
			newUser: true,
			userSrvCity: '',
			openingSentence: '',
			openingSentences: [
				'howdy again',
				'long time no see',
				'here to talk?',
				'feel it still? you should go to the doctor',
				'sweet home alabama intensifies!',
				'you are one step closer to having fun',
				'god leave the queen alone!',
				'back in black!',
				'maybe today',
				'salute your salmon',
				'where is my burger?',
				"let's twist again!",
				"stacy's mom is online!",
				'for here, am i sitting in a tin can',
				'johnny b quiet! im trying to chat with strangers!',
				'while you entering, pass the beer',
				'let the sunshine in (and stub it with sharp object)',
				"ain't no rest for naked!",
				"traps are gay! (but it's fine really)",
				'beware of all the cyber aids out there',
				'are you riding? put the phone down!!!',
				'layla, you got me on my bees',
				"knockin' on heaven's bore",
				'Like a rolling jon',
				'kiki, do you like and respect me in an aplatonic way?',
				'the thrill is gone! but the strangers still here :)',
				'smells like teen. ',
				'beat your meat, just beat it!',
				'Mr. Sandman, bring me a waifu ',
				`sweet home ${this.GetLocationByIp()}`
			]
		};
	}
	componentWillMount() {
		let isNewUser = localStorage.getItem('isNewUser');
		if (isNewUser == 'false') {
			this.setState({ newUser: false });
			let name = localStorage.getItem('nickname');
			if (name) {
				this.setState({ nickName: name });
			}
			this.setState({ openingSentence: this.pickRandomSentence() });
		}
	}
	async GetLocationByIp() {
		return await fetch('http://ip-api.com/json').then((data) => {
			this.setState({ userSrvCity: data.city });
			return data.city;
		});
	}
	renderNewUserScreen() {
		localStorage.setItem('isNewUser', false);
		return (
			<div id="wrapHome">
				<h2 className="subTitle">Are you the new guy?</h2>
				<img width="400px" src={image} />

				<div class="desc">
					<p>
						subscribe via your spotify account to connect to other K00L fucking people like yourself! if you
						want, you can type a nickname below
					</p>
					<input
						onChange={(evt) => this.setState({ nickName: evt.target.value })}
						className="nicknameInput"
						value={this.state.nickName}
						placeholder="here comes your name"
					/>
				</div>

				<button
					onClick={() => {
						if (this.state.nickName != null) localStorage.setItem('nickname', this.state.nickName);
						window.location.href = this.state.rightHref;
					}}
				>
					<img
						style={{
							width: '1em',
							position: 'relative',
							zIndex: 0,
							left: 0,
							top: '.2em',
							marginRight: '.3EM'
						}}
						src="/spotifyLogo.png"
					/>
					sub now!
				</button>
			</div>
		);
	}
	pickRandomSentence() {
		let len = this.state.openingSentences.length;
		const ran = Math.random() * len;
		let floor = Math.floor(ran);
		return this.state.openingSentences[floor];
	}
	renderOtherUserScreen() {
		return (
			<div id="wrapHome">
				<img src="/UGLY_BIG_LOGO.png" width="200px" />

				<h4 id="h4" className="subTitle ">
					{this.state.openingSentence}
				</h4>
				<div class="desc">
					<p>change your nickname and disappear into the night:</p>
					<input
						onChange={(evt) => this.setState({ nickName: evt.target.value })}
						className="nicknameInput"
						value={this.state.nickName}
						placeholder="here comes your name"
					/>
				</div>

				<button
					onClick={() => {
						if (this.state.nickName != null) localStorage.setItem('nickname', this.state.nickName);
						window.location.href = this.state.rightHref + '?nickname=' + this.state.nickName;
					}}
				>
					{' '}
					let me in!
				</button>
			</div>
		);
	}
	render() {
		if (this.state.newUser == true) {
			return this.renderNewUserScreen();
		}
		return this.renderOtherUserScreen();
	}
}
export default Home;
