import React,{ Component } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import App from '../../App';
import style from "./home.css";
import image from "./firstime.jpeg";

let moment = require('moment');

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          rightHref: "http://"+window.location.hostname+":5000/api/login"

        };
        //this.callApi();
      }
    componentDidMount() {

    }
  
    
    render() {
      return (
        <div id="wrapHome">   
         
            <h2>
        Are you the new guy?
        </h2>
        <img width = "400px" src={image}/>

        <p class="desc">
            subscribe via your spotify account to connect to
             other K00L fucking people like yourself!
            </p>
            
            <button onClick={()=>{window.location.href=this.state.rightHref}}> get me in!</button>

        </div>
      );
    }
  }
  export default Home

  