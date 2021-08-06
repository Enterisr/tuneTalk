import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Chat from "./chat/Chat.jsx";
import Home from "./home/Home.jsx";
import Layout from "./Layout/Layout";
const Main = () => (
  <main className="app-main">
    <Layout>
      <Switch>
        <Route path="/chat" component={Chat} />
        <Route exact path="/" component={Home} />
      </Switch>
    </Layout>
  </main>
);

export default Main;
