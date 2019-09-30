const rmClass = require('../Models/RoomManager');
const User = require('../Models/User');

//user = 	constructor(ip, connectedIn, spotifyAcssesToken, spotifyID = 'notConnected', socketID = 'notConnected') {
const geners = [];
for (let i = 0; i < 20; i++) {
	geners.push(i);
}
let rm = new rmClass('f');
function BuildUsers() {
	for (let userIDX = 0; userIDX < 10; userIDX++) {
		let taste = [];
		for (let i = 0; i < 4; i++) {
			let genereidx = Math.floor(Math.random() * geners.length);
			taste.push(geners[genereidx]);
		}
		rm.users.push(new User(taste));
	}
}
function BuildUser() {
	let taste = [];
	for (let i = 0; i < 4; i++) {
		let genereidx = Math.floor(Math.random() * geners.length);
		taste.push(geners[genereidx]);
	}
	return new User(taste);
}

function test() {
	BuildUsers();
	let user2 = BuildUser();
	console.log('me: ');
	console.log(user2);
	console.log('him: ');
	console.log(rm.SearchRoom(user2));
	console.log('others: ');
	rm.users.forEach((user) => console.log(user));
}
test();
