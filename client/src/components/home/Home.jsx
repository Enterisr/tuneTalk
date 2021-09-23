import React, { Component } from "react";
import ReactDOM from "react-dom";
import style from "./home.css";
import Utils from "../../Utils";
import cogoToast from "cogo-toast";
class Home extends React.Component {
  constructor(props) {
    super(props);
    let redirectHref = Utils.GetServerURI() + "/newHere";
    this.state = {
      redirectHref,
      nickName: null,
      newUser: true,
      userSrvCity: "",
    };
  }
  componentDidMount() {
    let isNewUser = localStorage.getItem("isNewUser");
    if (isNewUser == "false") {
      this.setState({ newUser: false });
      let name = localStorage.getItem("nickname");
      if (name) {
        this.setState({ nickName: name });
      }
    }
    if (window.location.search.includes("disconnect")) {
      cogoToast.error("Seems like we disconnected! You can connect again now", {
        hideAfter: 0,
      });
    }
  }

  renderNewUserScreen() {
    localStorage.setItem("isNewUser", false);
    return (
      <div id="wrapHome">
        <h2 className="subTitle">Are you the new guy?</h2>
        <div class="desc">
          <p>
            subscribe via your spotify account to connect to other K00L people
            like yourself! if you want, you can type a nickname below
          </p>
          <input
            onChange={(evt) => this.setState({ nickName: evt.target.value })}
            className="nicknameInput"
            value={this.state.nickName}
            placeholder="here comes your name"
          />
        </div>

        <button
          onClick={() => {
            if (this.state.nickName != null)
              localStorage.setItem("nickname", this.state.nickName);
            window.location.href = this.state.rightHref;
          }}
        >
          <img
            style={{
              width: "1em",
              position: "relative",
              zIndex: 0,
              left: 0,
              top: ".2em",
              marginRight: ".3EM",
            }}
            src="/spotifyLogo.png"
          />
          sub now!
        </button>
      </div>
    );
  }

  renderOtherUserScreen() {
    return (
      <div id="wrapHome">
        <h4 id="h4" className="subTitle ">
          Talk to other people. about... Music!
        </h4>
        <div class="desc">
          <p>choose your nickname:</p>
          <input
            onChange={(evt) => this.setState({ nickName: evt.target.value })}
            className="nicknameInput"
            value={this.state.nickName}
            placeholder="here comes your name"
          />
        </div>

        <button
          onClick={() => {
            if (this.state.nickName != null)
              localStorage.setItem("nickname", this.state.nickName);
            window.location.href =
              this.state.redirectHref + "?nickname=" + this.state.nickName;
          }}
        >
          {" "}
          <img className="spotifyLogo_img" src="spotifyLogo.png" />
          Connect
        </button>
      </div>
    );
  }
  render() {
    if (this.state.newUser == true) {
      return this.renderNewUserScreen();
    }
    return this.renderOtherUserScreen();
  }
}
export default Home;
