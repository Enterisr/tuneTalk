import React from 'react';
import ReactDOM from 'react-dom';
import "./fuckyoureact.css";
import io from 'socket.io-client';
import App from '../../App';
import swal from 'sweetalert2';
import messageSound from "../../Message.mp3";
let moment = require('moment');
class Title extends React.Component {
    componentDidMount(){
     // swal("MOUNTED!");
    }
    render() {
      return <div id="title"> {this.props.value}</div>
    }
  }
  class SendButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      
      };
    }
    sendMessage() {
      this.props.onClick();
    }
    render() {
      return <button
       className={(this.props.disabled ? "activeButton" : "passiveButton")}
       disabled = {(this.props.disabled)?   "":"disabled"} 
       onClick={() => this.sendMessage()}> send</button>
    }
  }
  
  
  class Message extends React.Component {  
    constructor(props) {
      super(props);
      this.state = {
        reacived: "",
        style:"none"
      };
  //    this.style = (this.props.IsAuthor ? "MyMessageStyle" : "OtherMessageStyle");
    } 
    render() {
      return (
        <div className={(this.props.IsAuthor ? "MyMessageStyle" : "OtherMessageStyle")}>{this.props.val}</div>
      );
    }
  
  }
  class Writer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }
    sendMessageToBody(msg) {
      this.props.onClick(msg);
    }
  
    updateInputValue(evt) {
      const text = evt.target.value;
      this.props.onChange(text);
    }
    render() {
      let Writer =
        <div id="Writer">
          <input  disabled = {(this.props.disabled)?   "":"disabled"} value={this.props.inputValue} id="inputSpan" type="text" onChange={evt => this.updateInputValue(evt)} />
          <SendButton  disabled ={this.props.disabled} onClick={() => this.sendMessageToBody(this.state.inputValue)} />
        </div>;
      return Writer;
    }
  }
  
  class ChatBody extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
  
      };
  
    }
    renderMessage = (messageVal, key,Author) => {
      return <Message val={messageVal} key={key} IsAuthor={Author}/>;
    }
    renderMessages = () => {
      let Messages = [];
      for (let i = 0; i < this.props.chatLog.length; i++) {
        Messages.push(this.renderMessage(this.props.chatLog[i], i, this.props.chatLogOwnerShip[i]));
      }
      return Messages;
    }
  
    render() {
      const body = <div id="ChatBody">
        {this.renderMessages()}
      </div>;
      return body;
    }
  }
  
  class EntireChat extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        inputValue: 'something sweet',
        chatLog: [],
        chatLogOwnerShip: [],
        servereq : "none",
        socket: io('/my-namespace'),
        roomID : 0,
        canWrite:false,
        backgroundURL: ""
      };
      //this.callApi();
    }
    componentDidMount(){
      fetch('/api/login', {
        method: 'GET',
        headers: {
          'Content-Type':  "text/html"
        }
      });
     
     this.state.socket.on("New message",
     (msg,time)=>{
      var audio = new Audio('../../Message.mp3');
      audio.play();
      this.AppendMessage(msg,time,false);
     });
     this.state.socket.on("enteredRoom",
     (msg,time)=>{

     this.setState({roomID:msg,canWrite:true});
     fetch('/CoverArt', {
      method: 'GET',
      headers: {
        'Content-Type':  "text/HTML"
      }
    }).then((URL)=>{
    this.setState({backgroundURL:URL});
    });
    }
);
     this.state.socket.on("roomEmpty",
     (msg,time)=>{
      this.setState({roomID:msg,chatLog:[],chatLogOwnerShip:[],canWrite:false});

     });
    }



    PostMessage =  (chat) => {
      let dateRecived = -1;
      let message = this.state.inputValue;
      let x = true;
     // this.callApi();

  /*     fetch('/api/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: this.state.inputValue }),
      })    
      .then(res => res.text())//response type
      .then(time => this.AppendMessage(this.state.inputValue ,time,true))
      .then((res)=>{ this.state.socket.emit("New message",message); console.log(message); return res;})
 */
     // .finally(res => res = 1); //log the data;

//  this.setState({ responseToPost: body });
this.state.socket.emit("New message",message); 
console.log(message);
this.AppendMessage(this.state.inputValue ,moment().format("HH:mm:ss"),true);
    }

    SendMessage = () => {
      if(this.state.inputValue!==""){
          this.PostMessage(this.state.chatLog.slice());
    }
  
    }

    AppendMessage= (val,time,owner)=>{
      const timeStyle = {
        fontSize: '10px',
        textAlign: 'left',
        color:'green'
      };
      const chat = this.state.chatLog.slice();
      let WholeDiv = (<><div style={timeStyle}>{time}</div><div>{val}</div></>);
      chat.push(WholeDiv);
      const chatO = this.state.chatLogOwnerShip.slice();
      chatO.push(owner);
      this.setState({ chatLog: chat });
      this.setState({ chatLogOwnerShip: chatO });
      if(owner)
      this.ClearChat();
    }
    renderChatBody() {
      return (
        <ChatBody chatLog={this.state.chatLog} chatLogOwnerShip={this.state.chatLogOwnerShip}></ChatBody >);
    }
    ClearChat = ()=>{
      this.setState({inputValue:""});
    }
    onTextEdit = (inputValue) => {
      this.setState({ inputValue: inputValue });
    }
    renderWriter() {
      let style = {
        backgroundImage: "url(" + this.state.backgroundURL + ")",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      };
      return <Writer 
      inputValue= {this.state.inputValue} 
      onClick={this.SendMessage} 
      onChange={this.onTextEdit}
      disabled = {this.state.canWrite}
      />;

    }
  
    HandleKeyPress = (e) => {
  
      if (e.key === "Enter") {

        this.SendMessage();
      }
    }

    render() {
      return (<div id="reactWrap" onKeyPress={this.HandleKeyPress}>
      <Title value = {this.state.roomID}/>
        {this.renderChatBody()}
        {this.renderWriter()}
      </div>);
  
    }
  }

  export default EntireChat;