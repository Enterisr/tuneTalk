import React, { useState, useEffect } from 'react';
import './Title.css';
export default function Title(props) {
	let href = `${window.location.protocol}//${window.location.hostname}:${window.location.port ? '5000' : ''}`;
	let [ titleValue, setTitleValue ] = useState('searching for a friend...');

	useEffect(
		() => {
			async function fetchTitle() {
				let res = await fetch(href + '/getTitle', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ appStatus: props.chatState })
				});
				let title = await res.text();
				title = title.replace('#user#', props.otherUser);
				title = title.replace('#self#', window.localStorage.getItem('nickname'));
				setTitleValue(title);
			}
			fetchTitle();
		},
		[ props.chatState, props.otherUser ]
	);

	return (
		<div id="title" className={'titleBar ' + props.chatState}>
			{' '}
			{titleValue}
			{props.chatState == 'roomEmpty' && (
				<React.Fragment>
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
				</React.Fragment>
			)}
		</div>
	);
}
