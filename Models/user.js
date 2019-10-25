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
		nickName,
		spotifyID = 'notConnected',
		socketID = 'notConnected'
	) {
		this.ip = ip;
		this.connectedIn = connectedIn;
		this.roomID = -1;
		this.roomManager = roomManager;
		this.spotifyID = spotifyID;
		this.nickName = nickName;
		this.socket = 'not bined yet';
		this.access_token = spotifyAcssesToken;
		this.favArtists = -1;
		this.chatter = '';
		this.hasActualTaste = false;
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
		if (this.favArtists.length > 0) {
			this.backgroundImage = this.favArtists[0].images[0];
			this.hasActualTaste = true;
		} else {
			/* await axios.get('https://api.spotify.com/v1/artists', {
				//some random shit to users with empty spotify account.
				headers: { Authorization: 'Bearer ' + this.access_token },
				ids: '0gxyHStUsqpMadRV0Di1Qt,0PFtn5NtBbbUNbU9EAmIWF,7hJcb9fa4alzcOq3EaNPoG'
			});*/ this.favArtists = [
				{
					external_urls: {
						spotify: 'https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt'
					},
					followers: {
						href: null,
						total: 452908
					},
					genres: [
						'dance pop',
						'dance rock',
						'disco',
						'europop',
						'new romantic',
						'new wave',
						'new wave pop',
						'soft rock'
					],
					href: 'https://api.spotify.com/v1/artists/0gxyHStUsqpMadRV0Di1Qt',
					id: '0gxyHStUsqpMadRV0Di1Qt',
					images: [
						{
							height: 640,
							url: 'https://i.scdn.co/image/123732b665ec9be0bc8d0d55283aa2ba579304d5',
							width: 640
						},
						{
							height: 320,
							url: 'https://i.scdn.co/image/e0da19ac0df629fa59b53f5c06457b51fdf636a5',
							width: 320
						},
						{
							height: 160,
							url: 'https://i.scdn.co/image/1fc6550292a3a8770b8d372f46702b35debb28d5',
							width: 160
						}
					],
					name: 'Rick Astley',
					popularity: 66,
					type: 'artist',
					uri: 'spotify:artist:0gxyHStUsqpMadRV0Di1Qt'
				},
				{
					external_urls: {
						spotify: 'https://open.spotify.com/artist/0PFtn5NtBbbUNbU9EAmIWF'
					},
					followers: {
						href: null,
						total: 1213637
					},
					genres: [ 'album rock', 'mellow gold', 'rock', 'soft rock', 'yacht rock' ],
					href: 'https://api.spotify.com/v1/artists/0PFtn5NtBbbUNbU9EAmIWF',
					id: '0PFtn5NtBbbUNbU9EAmIWF',
					images: [
						{
							height: 640,
							url: 'https://i.scdn.co/image/a47fe4b4087afd805a6e40730023b5d182423990',
							width: 640
						},
						{
							height: 320,
							url: 'https://i.scdn.co/image/83fcf2c20ec747118b954242691499aa3cbfb202',
							width: 320
						},
						{
							height: 160,
							url: 'https://i.scdn.co/image/f013f3bdc61ec18986d4f9e411689fd28b19a013',
							width: 160
						}
					],
					name: 'TOTO',
					popularity: 75,
					type: 'artist',
					uri: 'spotify:artist:0PFtn5NtBbbUNbU9EAmIWF'
				},
				{
					external_urls: {
						spotify: 'https://open.spotify.com/artist/7hJcb9fa4alzcOq3EaNPoG'
					},
					followers: {
						href: null,
						total: 5181337
					},
					genres: [ 'g funk', 'gangster rap', 'hip hop', 'pop rap', 'rap', 'west coast rap' ],
					href: 'https://api.spotify.com/v1/artists/7hJcb9fa4alzcOq3EaNPoG',
					id: '7hJcb9fa4alzcOq3EaNPoG',
					images: [
						{
							height: 640,
							url: 'https://i.scdn.co/image/11208d65843456cf3854717b8e411ef8fede7141',
							width: 640
						},
						{
							height: 320,
							url: 'https://i.scdn.co/image/4ddba58867285a1e858291a108613526df2ce934',
							width: 320
						},
						{
							height: 160,
							url: 'https://i.scdn.co/image/1e67815be9174e75753d52a006b86077a39719cf',
							width: 160
						}
					],
					name: 'Snoop Dogg',
					popularity: 84,
					type: 'artist',
					uri: 'spotify:artist:7hJcb9fa4alzcOq3EaNPoG'
				}
			];

			this.backgroundImage = this.favArtists[0].images[0];
		}
		this.isWaiting = false;
		this.musicTaste = this.GetGeneresFromArtists();
		return 'yessss';
	}

	BindToSocket(socket) {
		this.socket = socket;
		if (!this.hasActualTaste) {
			this.socket.emit('noActualTaste');
		}
		this.socket.on('New message', (msg) => {
			this.socket.to(this.roomID).emit('New message', msg, moment().format('HH:mm:ss'));
		});
		this.socket.on('typing', () => {
			this.socket.to(this.roomID).emit('typing');
		});
		this.socket.on('disconnect', () => {
			console.log('bye faggot!');
			console.info(this.nickName + ' left ' + this.chatter.nickName + ' alone');

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
			this.socket.emit('enteredRoom', {
				roomID: this.roomID,
				backgroundImage: roomBacground,
				chatterNick: this.chatter.nickName
			});
		});
	}
	keepLooking() {
		this.isWaiting = true;
		this.chatter = false;
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
