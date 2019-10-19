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
const RoomManager = require('./Models/roomManager');
const rm = new RoomManager('name', io);
const nsp = io.of('/my-namespace');
var cors = require('cors');
var cookieParser = require('cookie-parser');

const winston = require('winston');
let uncooperativeShitCount = 0;
var client_id = '072359457f254ab1b168ae2643926e38'; // Your client id
var client_secret = '53c148b3c9434846bec6bc7238957728'; // Your secret
let redirect_uri = port.toString().includes('5000') //dev
	? 'http://192.168.1.102:5000/callback/'
	: 'https://tunetalk.herokuapp.com/callback';
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public')).use(cors()).use(cookieParser());
//let roomManager = new RoomManager('/my-namespace');
const logger = winston.createLogger({
	transports: [ new winston.transports.Console(), new winston.transports.File({ filename: 'combined.log' }) ]
});
app.get('/newHere', (req, res) => {
	var state = generateRandomString(16);
	res.cookie('spotify_auth_state', state);
	let nickName = req.query.nickname;
	nickName = nickName ? nickName : 'anon ' + uncooperativeShitCount++;
	res.cookie('nickName', nickName);
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
	let nickName = req.cookies.nickName;
	request.post(authOptions, async function(error, response, body) {
		var access_token = body.access_token;
		user = new User(req.ip, new moment(), access_token, rm, nickName);
		let connectedInFormated = user.connectedIn.format('DD/MM/YYYY HH:mm:ss');
		logger.info([
			{ user: 'connected' },
			{
				'ip ': user.ip,
				connectedIn: connectedInFormated,
				token: access_token,
				nickName: nickName
			}
		]);

		rm.usersAuthing.push(user);
		await user.ConnectToSpotify();
		let uri = process.env.FRONTEND_URI || 'http://192.168.1.102:3000';
		res.redirect(uri + '/chat?access_token=' + access_token);
	});
});
nsp.on('connection', function(socket) {
	socket.on('auth', function(authToken) {
		let user = rm.BindToSocket(socket, authToken);
		if (user) {
			console.log('user socket' + user.socket.id);
			rm.SearchRoom(user);
		} else {
			socket.emit('disconnected');
		}
	});
});

exports.EmitToRoom = function(room, eventName, msg) {
	nsp.in(room.roomID).emit(eventName, msg);
};
//exports.EmitToSocket = function(socket, msg) {};
if (process.env.NODE_ENV === 'production') {
	// Serve any static files
	app.use(express.static(path.join(__dirname, 'client/build'))).use(cors()).use(cookieParser());
	app.use(express.static('client/build'));

	// Express serve up index.html file if it doesn't recognize route
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}
function generateRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

http.listen(port, () => console.log(`Listening on port ${port}`));
