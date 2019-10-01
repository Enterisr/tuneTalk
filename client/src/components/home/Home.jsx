import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import App from '../../App';
import { Redirect } from 'react-router-dom';
import style from './home.css';
import autoBind from 'react-autobind';

import image from './firstime.jpeg';

let moment = require('moment');

class Home extends React.Component {
	constructor(props) {
		super(props);
		let href = window.location.href.includes(':3000')
			? `http://${window.location.hostname}:5000/newHere`
			: `https://${window.location.hostname}/newHere`;
		this.state = {
			rightHref: href
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
						window.location.href = this.state.rightHref;
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
