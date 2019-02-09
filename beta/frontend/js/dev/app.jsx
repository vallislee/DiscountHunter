/*jshint esversion: 6 */
import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'

import Homepage from "./homepage.jsx";
import Pricepage from "./pricepage.jsx";

(function(){
    "use strict";
}());

class App extends Component {

    constructor(prop){
        super(prop);
        this.state = {
            url: null,
            priceChartData: null,
            tableChartData: null,
        }

        this.setURL=this.setURL.bind(this);
    }

    setChartData(data){
        this.state.priceChartData = data;
        console.log("chart data set");
    }

    setTableData(data){
        this.state.tableChartData = data;
        console.log("table data set");
    }

    setURL(url){

        this.state.url = url;
        console.log(this.state);
        console.log("url set");
    }

    

    render() {
       return (
        <Switch>
            <Route exact path='/' render={()=><Homepage setURL={this.setURL}/>} />
             <Route  path='/price' render={()=><Pricepage url={this.state.url}/>} />
            {/* <Route  path='/price' component={Pricepage} /> */}
        </Switch>
       );
    }
 }

window.onload = function(){
    ReactDOM.render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>,
        document.getElementById('main')
    );
};
