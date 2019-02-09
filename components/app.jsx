/*jshint esversion: 6 */
import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'

var home = require('./homepage.jsx')
var profile = require('./profile.jsx');
var price = require('./pricepage.jsx');
var registration = require('./registration.jsx');
var contact = require('./contactus.jsx');
var credits = require('./credits.jsx');

(function () {
    "use strict";


    class App extends Component {

        constructor(prop) {
            super(prop);
            this.state = {
                url: null,
                priceChartData: null,
                tableChartData: null,
            }
        }

        render() {
            return (
                <Switch>
                    <Route exact path='/' component={home.Homepage} />
                    <Route path='/price' component={price.Pricepage} />
                    <Route path='/profile' component={profile.ProfilePage} />
                    <Route path='/contactUs' component={contact.ContactUsPage} />
                    <Route path='/credits' component={credits.CreditsPage} />
                </Switch>
            );
        }
    }


    window.onload = function () {

        ReactDOM.render(
            <BrowserRouter>
                <App />
            </BrowserRouter>,
            document.getElementById('main')
        );

        ReactDOM.render(
            <home.Searchbar />,
            document.getElementById('title-search')
        );

        ReactDOM.render(
            <registration.LoginModal />,
            document.getElementById('login-modal')
        );

        ReactDOM.render(
            <registration.SignUpModal />,
            document.getElementById('registration-modal')
        );

        checkUserStatus();
        loadListener();

    };

    // Show or hide account icons in nav bar
    // -----------------------------------------
    var checkUserStatus = function () {
        var isUserLogin = false;

        if (api.getCurrentUser() != null) isUserLogin = true;
        return setAccountIcon(isUserLogin);

    }

    var setAccountIcon = function (isUserLogin) {
        setSignInVisible(!isUserLogin);
        setSignUpVisble(!isUserLogin);
        setProfileVisible(isUserLogin);
        setSignOutVisible(isUserLogin);
    }

    var setSignInVisible = function (bool) {
        if (bool) return document.getElementById("login").classList.remove("hide");
        return document.getElementById("login").classList.add("hide");
    }

    var setSignUpVisble = function (bool) {
        if (bool) return document.getElementById("signup").classList.remove("hide");
        return document.getElementById("signup").classList.add("hide");
    }

    var setProfileVisible = function (bool) {
        if (bool) return document.getElementById("profile").classList.remove("hide");
        return document.getElementById("profile").classList.add("hide");
    }

    var setSignOutVisible = function (bool) {
        if (bool) return document.getElementById("signout").classList.remove("hide");
        return document.getElementById("signout").classList.add("hide");
    }

    // ----------------------------------------

    // Event Listener 

    var loadListener = function () {
        addSignOutListener();
        addSignInListener();
        addSignUpListener();
    }
    var addSignOutListener = function () {
        document.getElementById("signout").addEventListener('click', function (e) {
            api.signout();
            window.location = "/";
        })
    }

    var addSignInListener = function () {

        document.getElementById("form-login").addEventListener('submit', function (e) {
            e.preventDefault();

            var email = document.querySelector("#form-login [name=email]").value;
            var password = document.querySelector("#form-login [name=password]").value;
            var captcha = document.querySelector("#form-login [name=g-recaptcha-response]").value;


            api.signin(email, password, captcha, function (err, res) {
                if (err) {
                    return document.querySelector("#form-login .warning").innerHTML = err;
                }

                return window.location = "/";
            })
        })
    }

    var addSignUpListener = function () {
        document.getElementById("form-registration").addEventListener('submit', function (e) {
            e.preventDefault();

            var username = document.querySelector("#form-registration [name=username] ").value;
            var email = document.querySelector("#form-registration [name=email]").value;
            var password = document.querySelector("#form-registration [name=password]").value;
            var rePassword = document.querySelector("#form-registration [name=password2]").value;
            var captcha = document.querySelector("#form-registration [name=g-recaptcha-response]").value;

            if (password != rePassword) return document.getElementById("warn-password").classList.remove("hide");

            api.signup(username, email, password, captcha, function (err, res) {
                if (err) return document.querySelector("#form-registration .warning").innerHTML = err;
                return window.location = "/";
            })
        })
    }

}());