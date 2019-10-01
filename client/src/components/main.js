import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Chat from './chat/Chat.jsx';
import Home from './home/Home.jsx';

// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"
const Main = () => (
	<main>
		<Switch>
			<Route path="/chat" component={Chat} />
			<Route exact path="/" component={Home} />
		</Switch>
	</main>
);

export default Main;
