const moment = require('moment');
const Server = require("../server");

class Room{
    constructor(user, connectedIn,roomID,nameSpace){
        this.roomID = roomID;

       this.OpeningUser = user;
       this.connectedIn = connectedIn;
        this.nameSpace  = nameSpace;
        this.users = [];
        this.full = false;
    }
    ConnectUser(user){
        console.log("this is room number "+this.roomID+" there are "+this.users.length+ " users here");

        user.socket.join(this.roomID.toString(),()=>{
            console.log(user.name +" connected to room number "+this.roomID);
            user.socket.on('New message', (msg)=>{
           //   console.log(user.name+ " said "+ msg+ "to "+this.roomID);
              let time =  moment(new Date()).format("HH:mm:ss").toString();
              user.socket.to(this.roomID).emit('New message', msg,time);   
                 console.log(user.name+ " said "+ msg + " to room: "+  this.roomID);
            });
        });
        user.roomID = this.roomID;
       if(this.users.length==1){
        Server.EmitToRoom(this,"enteredRoom","you've connected to room "+this.roomID);
        this.users.push(user);

       }
       else if(this.users.length>2){

       }
       else{
        Server.EmitToRoom(this,"roomEmpty","searching new friend for you...");  
        this.users.push(user);
   
    }

       console.log('');
    }

     DisconnectUser(userSocket){
    
      let returnArr = this.users.filter(user=>user.socket.id!=userSocket.id);
        console.log("user "+ userSocket.id+" leaved room "+this.roomID);
          Server.EmitToRoom(this,"roomEmpty","userLeaved! searching new friend for you...");
     this.users = returnArr;
     return returnArr;
    }
    isYouruser(socket){
        let user = "";
        this.users.forEach((checkedUser)=>{
            if(checkedUser.socket.id===socket.id){
                user = checkedUser;
            }
        });
        return user;
    }
  
}
module.exports = Room;