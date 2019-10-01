import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import App from '../../App';
import style from './home.css';
import image from './firstime.jpeg';

let moment = require('moment');

class Home extends React.Component {
	constructor(props) {
		super(props);
		let href = window.location.href.includes(':3000')
			? `http://${window.location.hostname}:5000/newHere`
			: `https://${window.location.hostname}/newHere`;
		this.state = {
			rightHref: href,
			redirect: false,
			token: ''
		};
	}
	componentDidMount() {}

	render() {
		return (
			<div id="wrapHome">
				<h2>Are you the new guy?</h2>
				<img width="400px" src={image} />

				<p class="desc">
					subscribe via your spotify account to connect to other K00L fucking people like yourself!
				</p>

				<button
					onClick={() => {
						//	window.location.href = this.state.rightHref;
						fetch(`https://${window.location.hostname}/newHere`).then((res) => {
							this.state.token = res.body;
							history.push('chat/' + this.state.token);
							this.state.redirect = true;
						});
					}}
				>
					{' '}
					get me in!
				</button>
			</div>
		);
	}
}
export default Home;
