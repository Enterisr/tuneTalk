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
    this.LastRoomID = 0;
    this.nameSpace = nameSpace;
    this.userCount = 0;
    this.users = new Map();
    this.io = io;
    this.usersAuthing = [];
    this.usersWaiting = new Map();
  }
  UserCreated(user) {
    this.usersAuthing.push(user);
  }
  UserAuthed(user, access_token) {
    let userIDX = this.usersAuthing.findIndex((u) => u.id === user.id);
    if (userIDX) this.usersAuthing.splice(userIDX, 1);
    user.access_token = access_token;
    this.users.set(user.id, user);
    //   this.UserWaiting(user);
  }
  UserWaiting(user) {
    user.ImWaiting();
    this.usersWaiting.set(user.id, user);
  }
  BindToSocket(socket, id, access_token) {
    const user = Array.from(this.users.values()).find(
      (us) => us.access_token === access_token && us.id === id && !us.socket.id
    );
    if (user) {
      console.log("binding to socket: " + user.id);

      user.BindToSocket(socket);
      return user;
    } else {
      console.log("cant find user");
      socket.disconnect();
      return false;
    }
  }
  DeleteUser(user) {
    this.users.delete(user.id);

    if (user.isWaiting) {
      this.usersWaiting.delete(user.id);
    }
    console.log(this.users.size + " users left");
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
    if (compatibeUser !== null && !compatibeUser.chatter) {
      let sharedArtist = this.FindSharedArtist(user, compatibeUser);
      user.chatter = compatibeUser;
      compatibeUser.chatter = user;
      user.JoinRoom("room-" + this.LastRoomID, sharedArtist);
      compatibeUser.JoinRoom("room-" + this.LastRoomID, sharedArtist);
      console.info("room-" + this.LastRoomID + " was created");

      let thisRoom = this.LastRoomID;
      this.LastRoomID++;
      return "room-" + thisRoom;
    } else {
      this.UserWaiting(user);
      console.log(this.usersWaiting.size + " users waiting");
      return false;
    }
  }

  SearchUsersWithNGenres(user, TasteReqierd, minTasteReqierd = 1) {
    const usersWaitingArr = Array.from(this.usersWaiting.values());
    for (let i = 0; i < usersWaitingArr.length; i++) {
      let comparedUser = usersWaitingArr[i];
      if (comparedUser.id !== user.id) {
        let compatibilityScore = 0;
        let isNotCompatible = false;

        let userTaste = [...user.musicTaste];
        let user2Taste = [...comparedUser.musicTaste];
        for (let j = 0; j < userTaste.length && !isNotCompatible; j++) {
          for (let k = 0; k < user2Taste.length; k++) {
            if (user2Taste[j] === userTaste[k]) {
              compatibilityScore++;
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
          this.usersWaiting.delete(user.id);
          this.usersWaiting.delete(comparedUser.id);
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
