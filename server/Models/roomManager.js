let User = require("./user");
const moment = require("moment");
const Room = require("./room");
var querystring = require("querystring");
require("dotenv").config();
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const port = process.env.PORT || 5000;
const prodURI = require("../CONSTS").productionURI;
const CONSTS = require("../CONSTS");
const utils = require("../utils");

let redirect_uri = port.toString().includes("5000")
  ? "http://192.168.14.10:5000/callback"
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
    this.usersLeaved = new Map();
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
      (us) => us.access_token === access_token && us.id === id //&& !us.socket.id
    );

    if (user) {
      this.RemoveFromLeavedUsers(user);
      console.log("binding to socket: " + user.id);
      user.BindToSocket(socket);
      return user;
    } else {
      console.log("cant find user");
      socket.disconnect();
      return false;
    }
  }
  RemoveFromLeavedUsers(user) {
    user.isRejoined = true;
  }
  DeleteUser(user) {
    this.usersLeaved.set(user.id, user);
    user.isRejoined = false;
    setTimeout(() => {
      this.usersLeaved.delete(user.id);
      console.log("timeout " + user.nickName);

      if (!user.isRejoined) {
        console.log("deleted user " + user.nickName);
        this.users.delete(user.id);
        if (user.isWaiting) {
          this.usersWaiting.delete(user.id);
        }
      }
    }, CONSTS.ttlMSForUser);
    console.log(this.users.size + " users are still here");
  }

  FindSharedArtist(user, user2) {
    for (let i = 0; i < user.favArtists.length; i++) {
      for (let j = 0; j < user2.favArtists.length; j++) {
        if (user.favArtists[i].id === user2.favArtists[j].id) {
          return user.favArtists[i];
        }
      }
    }
    return null;
  }
  SearchRoom(user) {
    let compatibeUser = this.SearchUsersWithNGenres(
      user,
      user.musicTaste.length
    );
    if (compatibeUser !== null && !compatibeUser.chatter) {
      let sharedArtist = this.FindSharedArtist(user, compatibeUser);
      let sharedGeners = user.FindMatchingGeners(compatibeUser);
      const roomID = "r/" + this.LastRoomID;
      user.chatter = compatibeUser;
      compatibeUser.chatter = user;
      user.JoinRoom(roomID, sharedArtist, sharedGeners);
      compatibeUser.JoinRoom(roomID, sharedArtist, sharedGeners);
      console.info(roomID + " was created");
      this.LastRoomID++;
      return roomID;
    } else {
      this.UserWaiting(user);
      console.log(this.usersWaiting.size + " users waiting");
      return false;
    }
  }

  SearchUsersWithNGenres(user, TasteReqierd, minTasteReqierd = 1) {
    const usersWaitingArr = Array.from(this.usersWaiting.values());
    const usersCompattibillity = {};
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
        usersCompattibillity[comparedUser.id] = compatibilityScore;
      }
    }

    const { maxProp: matchingUserId, max: maxTaste } =
      utils.findMaxObjectVal(usersCompattibillity);
    if (maxTaste > minTasteReqierd) {
      const matchingUser = usersWaitingArr.find((u) => u.id === matchingUserId);
      return matchingUser;
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
