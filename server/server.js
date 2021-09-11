const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

const http = require("http").createServer(app);
const request = require("request"); // "Request" library
const sockIO = require("socket.io");
const io = new sockIO(http, {
  origins: "*:*",
  pingTimeout: 3000,
  pingInterval: 4000,
  wsEngine: "ws",
});
const port = process.env.PORT || 5000;
const RoomManager = require("./Models/roomManager");
const TitleBuilder = require("./Models/TitleBuilder/TitleBuilder");
const roomManager = new RoomManager("name", io);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_SECRET;
const prodURI = require("./CONSTS").productionURI;
let redirect_uri = port.toString().includes("5000")
  ? "http://192.168.14.10:5000/callback"
  : `${prodURI}/callback`;
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public")).use(cors());
app.use(cookieParser());
//let roomManager = new RoomManager('/my-namespace');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
app.post("/getTitle", async (req, res) => {
  let title = await TitleBuilder.GetTitleForStatus(req.body.appStatus);
  res.send(title);
});

app.get("/newHere", (req, res) => {
  console.log("new here: " + req.query.nickname);
  roomManager.NewEnternce(req, res);
});

app.get("/callback", async function (req, res) {
  //callback from spotify oauth api after finishing auth
  let code = req.query.code || null;
  let user = roomManager.usersAuthing.find((u) => req.query.state === u.id);
  console.log(user.id + " returned from callback");
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
          "base64"
        ),
    },
    json: true,
  };
  request.post(authOptions, async function (error, response, body) {
    var access_token = body.access_token;
    roomManager.UserAuthed(user, access_token);
    console.log(user.nickName + " got acsess token");
    await user.getSpotifyData();
    let uri = process.env.FRONTEND_URI;
    res.redirect(uri + "/chat?access_token=" + access_token + "&id=" + user.id);
  });
});

function handleSocketReadyEvent(user, socket) {
  if (user) {
    const room = roomManager.SearchRoom(user);
    if (!room) {
      console.log("emitting roomEmpty for " + user.nickName);
      socket.emit("roomEmpty");
    }
  } else {
    console.error("user not found.");
    socket.emit("disconnected");
  }
}
io.on("connect", function (socket) {
  socket.on("ready", function ({ id, access_token }) {
    let user = roomManager.BindToSocket(socket, id, access_token);
    handleSocketReadyEvent(user, socket);
  });
});

exports.EmitToRoom = function (room, eventName, msg) {
  nsp.in(room.roomID).emit(eventName, msg);
};
//exports.EmitToSocket = function(socket, msg) {};
if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app
    .use(express.static(path.join(__dirname, "../client/build")))
    .use(cors())
    .use(cookieParser());
  app.use(express.static("client/build"));

  // Express serve up index.html file if it doesn't recognize route
  app.get("*", (req, res) => {
    //disable caching the HTML file, so it won't ask for non existing files
    ///(because CRA generates new files with each build...)
    response.header(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.header("Expires", "-1");
    response.header("Pragma", "no-cache");
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

http.listen(port, () => console.log(`Listening on port ${port}`));
