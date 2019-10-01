const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./Models/user');
//const RoomManager = require('./Models/roomManager');
const moment = require('moment');
const app = express();
const http = require('http').Server(app);
const request = require('request'); // "Request" library
const io = require('socket.io')(http, { origins: '*:*' });
const port = process.env.PORT || 5000;
var querystring = require('querystring');
const RM = require('./Models/roomManager');

var cors = require('cors');
var cookieParser = require('cookie-parser');
var client_id = '072359457f254ab1b168ae2643926e38'; // Your client id
var client_secret = '53c148b3c9434846bec6bc7238957728'; // Your secret
let redirect_uri = port.toString().includes('5000') //dev
	? 'http://192.168.1.102:5000/callback/'
	: 'https://tunetalk.herokuapp.com/callback';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public')).use(cors()).use(cookieParser());
//let roomManager = new RoomManager('/my-namespace');

app.get('/newHere', (req, res) => {
	var state = generateRandomString(16);
	res.cookie('spotify_auth_state', state);

	var scope = 'user-read-private user-read-email user-top-read';
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			})
	);
});
var nsp = io.of('/my-namespace');
app.get('/callback', async function(req, res) {
	let code = req.query.code || null;
	let authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			code: code,
			redirect_uri,
			grant_type: 'authorization_code'
		},
		headers: {
			Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64')
		},
		json: true
	};
	let user = '';
	request.post(authOptions, async function(error, response, body) {
		var access_token = body.access_token;
		user = new User(req.ip, new moment(), access_token);
		await user.ConnectToSpotify();
		let uri = process.env.FRONTEND_URI || 'http://192.168.1.102:3000';
		res.redirect(uri + '/chat?access_token=' + access_token);
		nsp.on('connection', function(socket) {
			user.BindToSocket(socket);
			//		RM.SearchRoom(user);
		});
	});
});
/*
nsp.on('connection', function(socket) {
	roomManager.NewEnternce(socket);

	socket.on('disconnect', function() {
		console.log('bye faggot!');
		roomManager.userLeaved(socket);
	});
});
*/
exports.EmitToRoom = function(room, eventName, msg) {
	nsp.in(room.roomID).emit(eventName, msg);
};
//exports.EmitToSocket = function(socket, msg) {};
if (process.env.NODE_ENV === 'production') {
	// Serve any static files
	app.use(express.static(path.join(__dirname, 'client/build'))).use(cors()).use(cookieParser());
}
function generateRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
/*
function GetRamdom(len) {
	let randy = Math.random() * (len - 1);
	console.log(randy);
	return Math.floor(randy);
}*/

//var stateKey = 'spotify_auth_state';

http.listen(port, () => console.log(`Listening on port ${port}`));
