const User = require('./Models/user');
const RoomManager = require('./Models/roomManager');
const moment = require('moment');
const { io } = require("./server");
/*
var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  socket.join('someRoom');
  console.log("connected!" +socket.client.id );
  socket.on('New message', function(msg){
    console.log(socket.client + " said "+ msg);
    let time =  moment(new Date()).format("HH:mm:ss").toString();
//    socket.broadcast.emit('message', msg,time);
io.to('someRoom').emit('New message', msg,time);
console.log(socket.client.id + " said "+ msg + " to: "+ socket.rooms);

 /*   app.get('/login', function(req, res) {
      var scopes = 'user-read-private user-read-email';
      res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + "072359457f254ab1b168ae2643926e38" +
        (scopes ? '&scope=' + encodeURIComponent('user-read-private user-read-email') : '') +
        '&redirect_uri=' + encodeURIComponent('http://localhost:3000/'));
        console.log(scopes);
      });
      
    
  });
});

*/
var nsp = io.of('/my-namespace');
//let RoomManager = new RoomManager(nsp);
let rm = new RoomManager('/my-namespace');
nsp.on('connection', function (socket) {
  let user = new User(socket, "", moment(), "username");
  rm.IsNewUser(socket.handshake.address) ? rm.NewEnternce
    :
    ;
  if () {
    let user = rm.NewUser(socket);
    //  console.log(rm.RoomIsWaiting());
    //console.log(models.User);
    /* socket.join('someRoom',()=>{
     console.log("connected!" +socket.client.id );
     socket.on('New message', function(msg){
       console.log(socket.client + " said "+ msg);
       let time =  moment(new Date()).format("HH:mm:ss").toString();
       socket.to("someRoom").emit('New message', msg,time);
          console.log(socket.client.id + " said "+ msg + " to: "+  Object.keys(socket.rooms));
   
      /* socket.to('someRoom').emit('New message', function(){
         console.log(socket.client.id + " said "+ msg + " to: "+  Object.keys(socket.rooms));
       });
     });
   
       
     });*/
  }
  rm.ConnectToRoom(user);
});
