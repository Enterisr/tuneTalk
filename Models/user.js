const axios = require('axios');
const RM = require('./roomManager');
const moment = require('moment');
/*class Message {
	constructor(socket, time, value, from, to) {
		this.socket = socket;
		this.time = time;
		this.value = value;
		this.from = from;
		this.to = to;
	}
}*/
class User {
	constructor(
		ip,
		connectedIn,
		spotifyAcssesToken,
		roomManager,
		spotifyID = 'notConnected',
		socketID = 'notConnected'
	) {
		this.ip = ip;
		this.connectedIn = connectedIn;
		this.roomID = -1;
		this.roomManager = roomManager;
		this.spotifyID = spotifyID;
		this.socket = 'not bined yet';
		this.access_token = spotifyAcssesToken;
		this.favArtists = -1;
		this.chatter = '';
	}

	async ConnectToSpotify() {
		const options1 = {
			headers: { Authorization: 'Bearer ' + this.access_token },
			json: true
		};
		const options2 = {
			headers: { Authorization: 'Bearer ' + this.access_token },
			json: true,
			limit: 50
		};
		const [ userStats, favArtists ] = await Promise.all([
			axios.get('https://api.spotify.com/v1/me', options1),
			axios.get('https://api.spotify.com/v1/me/top/artists', options2)
		]);
		this.spotifyID = userStats.data.id;
		this.favArtists = favArtists.data.items;
		this.backgroundImage = this.favArtists[0].images[0];
		this.musicTaste = this.GetGeneresFromArtists();
		return 'yessss';
	}

	BindToSocket(socket) {
		this.socket = socket;
		this.socket.on('New message', (msg) => {
			this.socket.to(this.roomID).emit('New message', msg, moment().format('HH:mm:ss'));
		});
		this.socket.on('disconnect', () => {
			console.log('bye faggot!');
			this.socket.to(this.roomID).emit('roomEmpty');
			this.roomManager.DeleteUser(this);
			if (this.chatter) this.roomManager.SearchRoom(this.chatter);
		});
	}
	GetGeneresFromArtists() {
		let geners = [];
		Object.entries(this.favArtists).forEach(([ key, artist ]) => {
			geners.push(...artist.genres);
		});
		return FindMostCommonGeners(geners, 6);
	}
	JoinRoom(roomName, roomBacground) {
		this.socket.join(roomName, () => {
			this.roomID = roomName;
			this.socket.emit('enteredRoom', { roomID: this.roomID, backgroundImage: roomBacground });
		});
	}
	keepLooking() {
		console.log('keep looking you snowflake asshole-' + this.socket.id);
	}
}

function FindMostCommonGeners(generes, howManyGenres) {
	let map = new Map();
	for (let genere of generes) {
		map.set(genere, (map.get(genere) || 0) + 1);
	}
	let mostCommonGeners = [];
	for (let i = 0; i < howManyGenres; i++) {
		let mostCommonGenre = null;
		let maxCount = -1;
		for (let [ genere, count ] of map.entries()) {
			if (count > maxCount) {
				maxCount = count;
				mostCommonGenre = genere;
			}
		}
		map.delete(mostCommonGenre);
		mostCommonGeners.push(mostCommonGenre);
	}
	return mostCommonGeners;
}

module.exports = User;
