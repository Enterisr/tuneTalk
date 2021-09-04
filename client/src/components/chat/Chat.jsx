import React from "react";
import "./chat.css";
import io from "socket.io-client";
import autoBind from "react-autobind";
import moment, { duration } from "moment";
import Sound from "react-sound";
import ChatBody from "./ChatBody/ChatBody";
import cogoToast from "cogo-toast";
import Title from "./ChatTitle/Title.js";
import Utils from "../../Utils";
import Writer from "./Writer/Writer.js";
class EntireChat extends React.Component {
  constructor(props, context) {
    const serverURI = Utils.GetServerURI();
    super(props, context);
    this.state = {
      inputValue: "",
      chatLog: [],
      chatLogOwnerShip: [],
      servereq: "none",
      socket: io(serverURI),
      otherUser: { nickName: "" },
      canWrite: false,
      backgroundURL: " ",
      isTheOtherUserTyping: false,
      playAudio: "STOPPED",
      style: {
        backgroundImage: "url('')" /*"url(" + this.state.backgroundURL + ")"*/,
      },
      windowHasFocus: false,
      chatState: "roomEmpty",
      isEmittedTyping: false,
    };
    autoBind(this);
  }
  onFocus = () => {
    this.setState({ windowHasFocus: !this.state.windowHasFocus });
    if (this.state.windowHasFocus) {
      document.title = "tuneTalk";
    }
  };

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
  }
  componentDidUpdate(prevProps, prevState) {
    const shouldEmitIsTyping =
      !this.state.isEmittedTyping &&
      prevState.inputValue !== this.state.inputValue &&
      this.state.inputValue;
    if (shouldEmitIsTyping) {
      this.state.socket.emit("typing");
      this.setState({ isEmittedTyping: true }, () =>
        setTimeout(() => this.setState({ isEmittedTyping: false }), 1000)
      );
    }
  }
  appendToTitle() {
    if (!this.state.windowHasFocus) {
      document.title.includes("new message!")
        ? (document.title = document.title)
        : (document.title = "new message!");
    } else {
      document.title = "tuneTalk";
    }
  }
  componentDidMount() {
    window.addEventListener("focus", this.onFocus);
    this.state.socket.on("New message", (msg, time) => {
      this.AppendMessage(msg, time, false);
      this.appendToTitle();
      this.setState({ playAudio: "PLAYING" });
    });
    this.state.socket.on("connect", () => {
      let url = new URL(window.location.href);
      let access_token = url.searchParams.get("access_token");
      let id = url.searchParams.get("id");
      this.state.socket.emit("ready", { id, access_token });
    });
    this.state.socket.on("disconnect", () => {
      //  this.props.history.push("/");
      this.setState({
        otherUser: {},
        chatState: "roomEmpty",
        chatLog: [],
        chatLogOwnerShip: [],
        canWrite: false,
        inputValue: "",
      });
    });
    this.state.socket.on("enteredRoom", ({ otherUser, sharedArtist }) => {
      this.setState(
        {
          otherUser,
          chatState: "enteredRoom",
          canWrite: true,
          inputValue: "You have a great taste!",
          style: {
            backgroundImage: 'url("' + sharedArtist.images[0].url + '")',
          },
        },
        () => {
          cogoToast.success("You both like: " + sharedArtist.name);
        }
      );
    });
    //
    this.state.socket.on("typing", () => {
      this.setState({ isTheOtherUserTyping: true, chatState: "typing" });
      if (!this.otherUserTypingTimer) {
        this.otherUserTypingTimer = setTimeout(() => {
          this.setState({
            isTheOtherUserTyping: false,
            chatState: "enteredRoom",
          });
          this.otherUserTypingTimer = false;
        }, 3000);
      }
    });

    this.state.socket.on("roomEmpty", (msg) => {
      this.setState({
        otherUser: {},
        chatState: "roomEmpty",
        chatLog: [],
        chatLogOwnerShip: [],
        canWrite: false,
        inputValue: "",
      });
    });
    this.state.socket.on("noActualTaste", () => {
      cogoToast.error(
        "we didn't caught your musical taste, so we picked one for you!  ❤️"
      );
    });
  }

  PostMessage() {
    let message = this.state.inputValue;
    this.state.socket.emit("New message", message);
    this.AppendMessage(
      this.state.inputValue,
      moment().format("HH:mm:ss"),
      true
    );
  }

  SendMessage() {
    if (this.state.inputValue !== "") {
      this.PostMessage(this.state.chatLog.slice());
    }
  }
  AppendMessage(val, time, owner) {
    const chat = this.state.chatLog.slice();
    chat.push({ value: val, time: time });
    const chatO = this.state.chatLogOwnerShip.slice();
    chatO.push(owner);
    this.setState({ chatLog: chat, chatLogOwnerShip: chatO });
    if (owner) this.setState({ inputValue: "" });
  }

  onTextEdit(inputValue) {
    this.setState({ inputValue });
  }

  HandleKeyPress(e) {
    if (e.key === "Enter") {
      this.SendMessage();
    }
  }

  render() {
    return (
      <div
        id="reactWrap"
        style={this.state.style}
        onKeyPress={this.HandleKeyPress}
      >
        <Title
          chatState={this.state.chatState}
          otherUser={this.state.otherUser}
        />

        <ChatBody
          chatLog={this.state.chatLog}
          chatLogOwnerShip={this.state.chatLogOwnerShip}
        />
        <Writer
          inputValue={this.state.inputValue}
          onClick={this.SendMessage}
          onChange={this.onTextEdit}
          disabled={this.state.canWrite}
        />
      </div>
    );
  }
}

export default EntireChat;
