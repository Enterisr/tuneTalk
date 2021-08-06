const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

const http = require("http").Server(app);
const request = require("request"); // "Request" library
const io = require("socket.io")(http, { origins: "*:*" });
const port = process.env.PORT || 5000;
const RoomManager = require("./Models/roomManager");
const TitleBuilder = require("./Models/TitleBuilder/TitleBuilder");
const roomManager = new RoomManager("name", io);
const nsp = io.of("/my-namespace");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_SECRET;
const prodURI = require("./CONSTS").productionURI;
let redirect_uri = port.toString().includes("5000")
  ? "http://192.168.1.16:5000/callback"
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
  roomManager.NewEnternce(req, res);
});

app.get("/callback", async function (req, res) {
  let code = req.query.code || null;
  let user = roomManager.usersAuthing.find((u) => req.query.state === u.id);
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
    let connectedInFormated = user.connectedIn.format("DD/MM/YYYY HH:mm:ss");
    roomManager.UserAuthed(user, access_token);

    logger.info([
      { user: "connected" },
      {
        "ip ": user.ip,
        connectedIn: connectedInFormated,
        token: access_token,
      },
    ]);

    await user.getSpotifyData();
    let uri = process.env.FRONTEND_URI;
    res.redirect(uri + "/chat?access_token=" + access_token);
  });
});
nsp.on("connection", function (socket) {
  socket.on("access_token", function (access_token) {
    let user = roomManager.BindToSocket(socket, access_token);
    if (user) {
      console.log("user socket" + user.socket.id);
      roomManager.SearchRoom(user);
    } else {
      //  socket.emit("disconnected");
    }
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
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

http.listen(port, () => console.log(`Listening on port ${port}`));
