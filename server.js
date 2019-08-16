const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./Models/user');
const RoomManager = require('./Models/roomManager');
const moment = require('moment');
const app = express();
const http = require('http').Server(app);
const request = require('request'); // "Request" library
const io = require('socket.io')(http,{ origins: '*:*'});
const port = process.env.PORT || 5000;
var querystring = require('querystring');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

let redirect_uri = 'http://192.168.1.102:5000/callback/';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
var client_id = '072359457f254ab1b168ae2643926e38'; // Your client id
var client_secret = '53c148b3c9434846bec6bc7238957728'; // Your secret

// your application requests authorization
const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
app.get('/api/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }));
});
app.get('/callback', function (req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        client_id + ':' + client_secret
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;

    var options = {
      url: 'https://api.spotify.com/v1/me/top/artists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
     request.get(options, function (error, response, body) {
      TOP_music = body.items;
      let favoriteImages = [];
      TOP_music.forEach((item)=>{
       favoriteImages.push(item.images[0]);
       app.post('/api/CoverArt', (req, res) => {   
        res.send({backgroundURL:favoriteImages[7]});
      });  
    });
  });
    let uri = process.env.FRONTEND_URI || 'http://192.168.1.102:3000';
    uri = uri + "/chat";

    res.redirect(uri + '?access_token=' + access_token);
  })
});
// API calls
/*app.get('/api/login', (req, res) => {
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: 'www.google.com',
      state:'32132131312'
    }));
});*/

app.post('/api/world', (req, res) => {
  
  res.send(moment(new Date()).format("HH:mm:ss").toString());
});




var nsp = io.of('/my-namespace');

let roomManager = new RoomManager('/my-namespace');
nsp.on('connection', function(socket){
 roomManager.NewEnternce(socket);




app.get('/api/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

socket.on('disconnect', function(){
  console.log("bye faggot!");
  roomManager.userLeaved(socket);

});
});

exports.EmitToRoom = function(room, eventName, msg) {
  nsp.in(room.roomID).emit(eventName, msg);
}
exports.EmitToSocket= function(socket, msg) {

}
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')))
  .use(cors())
  .use(cookieParser());;

}
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text; querystring
};

var stateKey = 'spotify_auth_state';

module.exports = app;


http.listen(port, () => console.log(`Listening on port ${port}`));

