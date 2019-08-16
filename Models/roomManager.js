const User = require('./user');
const moment = require('moment');
const Room = require('./room');
const Server = require("../server");
console.log("dsadadasdasfasfasf" +Server.toString());
class RoomManager {

    constructor(nameSpace) {
        this.rooms = [];
        this.LastRoomID = 0;
        this.nameSpace = nameSpace;
        this.userCount = 0;
    
    }
    userLeaved(socket) {
        let userToDelete = "";
        let room ="";
        let user="";
        let indexOfRoom = "-1";
       for(let i=0; i<this.rooms.length;i++){
           user=this.rooms[i].isYouruser(socket);  
            if(user){
            room=this.rooms[i];
            indexOfRoom = i;
            break;
        }
       }
       if(room){
      let reminingUsers =  room.DisconnectUser(socket);    
    }
         console.log(socket.toString());

        } 

        
    

    RoomIsWaiting(user) {
        let Open_room = false;
        this.rooms.forEach((room) => {
            if (room.users.length <2&&user.roomID!==room.roomID){
                Open_room = room;
            }});
                

        return Open_room;
    }
    NewRoom(user) {
        let newRoom = new Room(user, moment(), this.LastRoomID + 1, this.nameSpace);
        this.LastRoomID++;
        this.rooms.push(newRoom);
        //console.log(user.name + " created room number "+newRoom.roomID)
        return newRoom;
    }
    NewEnternce(userSocket) {
        this.userCount++;
        let user = new User(userSocket, "", moment(), "folk number" + (this.userCount ));
      this.Switchboard(user);
    }
    DisconectUserFromRoom(user){
        let Selectedroom = "";
        this.rooms.forEach((room)=>{
            if(room.roomID==user.roomID){
                Selectedroom = room; 
            }
        });
        Selectedroom.DisconnectUser(user.socket);
    }
    Switchboard(user){
       // let user = user;
        let room = this.RoomIsWaiting(user);
        let message = "";
        if (!room&&user.roomID==-1) {
            room = this.NewRoom(user);
            room.ConnectUser(user);

        }
        else if(user.roomID!=-1&&!room){
            //wait
        }
        else if(user.roomID!=-1&&room){
            //wait and delete your room 
            this.DisconectUserFromRoom(user);
            room.ConnectUser(user);

        }
        else {
            room.ConnectUser(user);

        }     

        return room;
    }


    IsNewUser(ip) {

        this.users.forEach((user) => {
            if (user.ip == ip) {
                //console.log(ip+"==?"+user.ip);
                //console.log("you are not new");

                return false;
            }
        });
        //  //console.log("you are  newwwwwww and gggggggggggggggggggggggggreen");

        return true;
    }
}

module.exports = RoomManager;