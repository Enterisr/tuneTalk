let User = require("./user");
const moment = require("moment");
const Room = require("./room");
var querystring = require("querystring");
require("dotenv").config();
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const port = process.env.PORT || 5000;
const prodURI = require("../CONSTS").productionURI;

let redirect_uri = port.toString().includes("5000")
  ? "http://192.168.1.16:5000/callback"
  : `${prodURI}/callback`;

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
  UserCreated(user) {
    this.usersAuthing.push(user);
  }
  UserAuthed(user, access_token) {
    let userIDX = this.usersAuthing.findIndex((u) => u.id === user.id);
    if (userIDX) this.usersAuthing.splice(userIDX, 1);
    user.access_token = access_token;
    this.UserWaiting(user);
  }
  UserWaiting(user) {
    user.keepLooking();
    this.usersWaiting.push(user);
  }
  BindToSocket(socket, access_token) {
    const user = this.usersWaiting.find(
      (us) => us.access_token === access_token
    );
    if (user) {
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
    console.log(this.users.length + " users left");
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
        if (user.favArtists[i].id === user2.favArtists[j].id) {
          return user.favArtists[i];
        }
      }
    }
    return user.favArtists[0];
  }
  SearchRoom(user) {
    let compatibeUser = this.SearchUsersWithNGenres(
      user,
      user.musicTaste.length
    );
    if (compatibeUser !== null) {
      let sharedArtist = this.FindSharedArtist(user, compatibeUser);
      user.chatter = compatibeUser;
      compatibeUser.chatter = user;
      user.JoinRoom("room-" + this.LastRoomID, sharedArtist);
      compatibeUser.JoinRoom("room-" + this.LastRoomID, sharedArtist);
      console.info(
        user.nickName + " was connected with " + compatibeUser.nickName
      );

      let thisRoom = this.LastRoomID;
      this.LastRoomID++;
      return "room-" + thisRoom;
    } else {
      console.log(this.usersWaiting.length + " users waiting");
      return false;
    }
  }

  SearchUsersWithNGenres(user, TasteReqierd, minTasteReqierd = 1) {
    for (let i = 0; i < this.usersWaiting.length; i++) {
      let comparedUser = this.usersWaiting[i];
      if (comparedUser.id !== user.id) {
        let compatibilityScore = 0;
        let isNotCompatible = false;
        console.log(user.socket.id + " music taste: " + user.musicTaste);
        console.log(
          comparedUser.socket.id + " music taste: " + comparedUser.musicTaste
        );
        let userTaste = [...user.musicTaste];
        let user2Taste = [...comparedUser.musicTaste];
        for (let j = 0; j < userTaste.length && !isNotCompatible; j++) {
          for (let k = 0; k < user2Taste.length; k++) {
            if (user2Taste[j] === userTaste[k]) {
              compatibilityScore++;
              console.log(
                comparedUser.socket.id +
                  " and " +
                  user.socket.id +
                  " loves " +
                  userTaste[j]
              );
              userTaste.splice(j, 1);
              user2Taste.splice(k, 1);

              j--;
              k--;
            }
          }
          isNotCompatible =
            j > TasteReqierd && compatibilityScore < TasteReqierd;
        }
        if (compatibilityScore >= TasteReqierd) {
          console.log("found compatibility of " + compatibilityScore);
          const IDXuser = this.usersWaiting.findIndex((u) => u.id === user.id);
          this.usersWaiting.splice(IDXuser, 1);
          this.usersWaiting.splice(i, 1);
          return comparedUser;
        }
      }
    }
    if (TasteReqierd > minTasteReqierd) {
      return this.SearchUsersWithNGenres(user, TasteReqierd - 1);
    } else {
      return null;
    }
  }
  NewEnternce(req, res) {
    User = require("./user");
    this.userCount++;
    let nickName = req.query.nickname;
    nickName = nickName ? nickName : "anon#" + this.userCount;
    const user = new User(req.ip, moment(), undefined, this, nickName);
    this.UserCreated(user);

    const scope = "user-read-private user-read-email user-top-read";
    res.redirect(
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: SPOTIFY_CLIENT_ID,
          scope,
          redirect_uri,
          state: user.id,
        })
    );
  }
}

module.exports = RoomManager;
