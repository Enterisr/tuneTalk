import React from "react";
import style from "./Layout.css";
function Layout(props) {
  return (
    <>
      <header>
        <a href="/" className="header-a">
          <img src="ugly_logo.png" className="header-logo" />
          <h1 className="mainTitle-h1">TuneTalk</h1>
        </a>
      </header>
      {props.children}
      <footer>
        <a href="https://github.com/Enterisr/" target="_blank">
          @Drunktolstoy Production
        </a>
      </footer>
    </>
  );
}
export default Layout;
