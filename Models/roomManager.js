const User = require('./user');
const moment = require('moment');
const Room = require('./room');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const request = require('request'); // "Request" library
const port = process.env.PORT || 5000;
const Server = require('../server');
var querystring = require('querystring');
var cors = require('cors');
var cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')).use(cors()).use(cookieParser());
var client_id = '072359457f254ab1b168ae2643926e38'; // Your client id
var client_secret = '53c148b3c9434846bec6bc7238957728'; // Your secret
let redirect_uri = 'http://192.168.1.102:5000/callback/';
class RoomManager {
	constructor(nameSpace) {
		this.rooms = [];
		this.LastRoomID = 0;
		this.nameSpace = nameSpace;
		this.userCount = 0;
		this.users = [];
		this.usersWaiting = [];
	}
	userLeaved(socket) {
		let userToDelete = '';
		let room = '';
		let user = '';
		let indexOfRoom = '-1';
		for (let i = 0; i < this.rooms.length; i++) {
			user = this.rooms[i].isYouruser(socket);
			if (user) {
				room = this.rooms[i];
				indexOfRoom = i;
				break;
			}
		}
		if (room) {
			let reminingUsers = room.DisconnectUser(socket);
		}
		console.log(socket.toString());
	}

	RoomIsWaiting(user) {
		let Open_room = false;
		this.rooms.forEach((room) => {
			if (room.users.length < 2 && user.roomID !== room.roomID) {
				Open_room = room;
			}
		});

		return Open_room;
	}
	NewRoom(user) {
		let newRoom = new Room(user, moment(), this.LastRoomID + 1, this.nameSpace);
		this.LastRoomID++;
		this.rooms.push(newRoom);
		//console.log(user.name + " created room number "+newRoom.roomID)
		return newRoom;
	}
	SearchRoom(user) {
		let compatibeUser = this.SearchUsersWithNGenres(user, user.musicTaste.length);
		if (compatibeUser !== null) {
			user.JoinRoom('room-' + this.LastRoomID);
			compatibeUser.JoinRoom('room-' + this.LastRoomID);
			this.LastRoomID++;
		} else {
			this.usersWaiting.push(user);
			user.keepLooking();
		}
	}
	SearchUsersWithNGenres(user, TasteReqierd, minTasteReqierd = 0) {
		for (let i = 0; i < this.usersWaiting.length; i++) {
			let comparedUser = this.users[i];
			let compatibilityScore = 0;
			let isNotCompatible = false;
			for (let j = 0; j < user.musicTaste.length && !isNotCompatible; j++) {
				for (let k = 0; k < user.musicTaste.length; k++) {
					if (comparedUser.musicTaste[j] === user.musicTaste[k]) {
						compatibilityScore++;
					}
				}
				isNotCompatible = j > TasteReqierd && compatibilityScore < TasteReqierd;
			}
			if (compatibilityScore === TasteReqierd) {
				console.log('found compatibility of ' + compatibilityScore);
				return comparedUser;
			}
		}
		if (TasteReqierd > minTasteReqierd) {
			return this.SearchUsersWithNGenres(user, TasteReqierd - 1);
		} else {
			return null;
		}
	}
	NewEnternce(userReq, res) {
		this.userCount++;
		var state = Server.generateRandomString(16);
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

		/*		app.app.get('/newHere', function(req, res) {
			var state = generateRandomString(16);
			res.cookie(stateKey, state);

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
		app.get('/callback', function(req, res) {
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
			request.post(authOptions, function(error, response, body) {
				var access_token = body.access_token;

				var options = {
					url: 'https://api.spotify.com/v1/me/top/artists',
					headers: { Authorization: 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
					TOP_music = body.items;
					let favoriteImages = [];
					TOP_music.forEach((item) => {
						favoriteImages.push(item.images[0]);
						app.post('/api/CoverArt', (req, res) => {
							res.send({ backgroundURL: favoriteImages[GetRamdom(favoriteImages.length - 1)] });
						});
					});
				});
				let uri = process.env.FRONTEND_URI || 'http://192.168.1.102:3000';
				uri = uri + '/chat';

				res.redirect(uri + '?access_token=' + access_token);
			});
		});

		app.get('/api/refresh_token', function(req, res) {
			// requesting access token from refresh token
			var refresh_token = req.query.refresh_token;
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				headers: { Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64') },
				form: {
					grant_type: 'refresh_token',
					refresh_token: refresh_token
				},
				json: true
			};

			request.post(authOptions, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					var access_token = body.access_token;
					res.send({
						access_token: access_token
					});
				}
			});
		});
		this.Switchboard(user);
		return user;*/
	}
	DisconectUserFromRoom(user) {
		let Selectedroom = '';
		this.rooms.forEach((room) => {
			if (room.roomID == user.roomID) {
				Selectedroom = room;
			}
		});
		Selectedroom.DisconnectUser(user.socket);
	}
	Switchboard(user) {
		// let user = user;
		let room = this.RoomIsWaiting(user);
		if (!room && user.roomID == -1) {
			room = this.NewRoom(user);
			room.ConnectUser(user);
		} else if (user.roomID != -1 && !room) {
			//wait
		} else if (user.roomID != -1 && room) {
			//wait and delete your room
			this.DisconectUserFromRoom(user);
			room.ConnectUser(user);
		} else {
			room.ConnectUser(user);
		}

		return room;
	}
}

module.exports = RoomManager;
