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
let redirect_uri = 'http://192.168.203.1/:5000/callback/';

class RoomManager {
	constructor(nameSpace, io) {
		this.rooms = [];
		this.LastRoomID = 0;
		this.nameSpace = nameSpace;
		this.userCount = 0;
		this.users = [];
		this.io = io;
		this.usersAuthing = []; //1st prop - auth, 2st - user [{'aasdasda31312',{user object}}]
		this.usersWaiting = [];
	}

	BindToSocket(socket, auth) {
		let idxToRemove = -1;
		let user = this.usersAuthing.find((user, idx) => {
			idxToRemove = idx;
			return user.access_token === auth;
		});

		if (typeof user !== 'undefined' /*&& isNewUser)*/) {
			this.usersAuthing.splice(idxToRemove, ++idxToRemove);
			this.users.push(user);
			user.BindToSocket(socket);
			return user;
		} else {
			socket.disconnect();
			return false;
		}
	}
	DeleteUser(user) {
		this.users = this.users.filter((cuser, idx) => {
			return cuser.socket.id !== user.socket.id;
		});
		if (user.isWaiting) {
			this.usersWaiting = this.usersWaiting.filter((cuser, idx) => {
				return cuser.socket.id !== user.socket.id;
			});
		}
		console.log(this.users.length + ' users left');
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
	FindSharedArtist(user, user2) {
		for (let i = 0; i < user.favArtists.length; i++) {
			for (let j = 0; j < user2.favArtists.length; j++) {
				if (user.favArtists[i].id == user2.favArtists[j].id) {
					return user.favArtists[i];
				}
			}
		}
		return user.favArtists[0];
	}
	SearchRoom(user) {
		let compatibeUser = this.SearchUsersWithNGenres(user, user.musicTaste.length);
		if (compatibeUser !== null) {
			let sharedArtist = this.FindSharedArtist(user, compatibeUser);
			const roomBackground = sharedArtist.images[0];
			user.chatter = compatibeUser;
			compatibeUser.chatter = user;
			user.JoinRoom('room-' + this.LastRoomID, roomBackground);
			compatibeUser.JoinRoom('room-' + this.LastRoomID, roomBackground);
			console.info(user.nickName + ' was connected with ' + compatibeUser.nickName);

			let thisRoom = this.LastRoomID;
			this.LastRoomID++;
			return 'room-' + thisRoom;
		} else {
			this.usersWaiting.push(user);
			user.keepLooking();

			console.log(this.usersWaiting.length + ' users waiting');
			return false;
		}
	}
	SearchUsersWithNGenres(user, TasteReqierd, minTasteReqierd = 1) {
		for (let i = 0; i < this.usersWaiting.length; i++) {
			let comparedUser = this.usersWaiting[i];
			let compatibilityScore = 0;
			let isNotCompatible = false;
			console.log(user.socket.id + ' music taste: ' + user.musicTaste);
			console.log(comparedUser.socket.id + ' music taste: ' + comparedUser.musicTaste);
			let userTaste = [ ...user.musicTaste ];
			let user2Taste = [ ...comparedUser.musicTaste ];
			for (let j = 0; j < userTaste.length && !isNotCompatible; j++) {
				for (let k = 0; k < user2Taste.length; k++) {
					if (user2Taste[j] === userTaste[k]) {
						compatibilityScore++;
						console.log(comparedUser.socket.id + ' and ' + user.socket.id + ' loves ' + userTaste[j]);
						userTaste.splice(j, 1);
						user2Taste.splice(k, 1);

						j--;
						k--;
					}
				}
				isNotCompatible = j > TasteReqierd && compatibilityScore < TasteReqierd;
			}
			if (compatibilityScore >= TasteReqierd) {
				console.log('found compatibility of ' + compatibilityScore);
				//				console.log('(' + compatibilityScore / this.users.musicTaste.length * 100 + '%)');

				this.usersWaiting.splice(i, 1);
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
	}
}

module.exports = RoomManager;
