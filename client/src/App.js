import React, { Component } from "react";
import "./App.css";
import Chat from "./components/chat/Chat.jsx";
import Main from "./components/main.js";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Main />
      </div>
    );
  }
}

export default App;
