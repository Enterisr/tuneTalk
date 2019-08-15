const moment = require('moment');
class Message{
    constructor(socket,time,value,from,to){
        this.socket = socket;
        this.time = time;
        this.value = value;
        this.from = from;
        this.to = to;
    }

    
}
class User{
    constructor(socket,conn,connectedIn,name,token=''){
        this.socket = socket;
        this.conn = conn;
        this.connectedIn = connectedIn;
        this.name = name;
        this.roomID  = -1;

        this.token  = token;
    }

    
    ConnectToSpotify(token){
        this.token = '';
    }

}

module.exports = User;