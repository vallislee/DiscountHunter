import React, { Component } from 'react';
import { GoogleLogin } from 'react-google-login';

var Recaptcha = require('react-recaptcha');

// code from https://foundation.zurb.com/building-blocks/blocks/login-box.html
(function () {

    "use strict";

    class CloseButton extends Component {
        render() {
            return (
                <button className="close-button" data-close="" aria-label="Close modal" type="button">
                    <span aria-hidden="true">&times;</span>
                </button>
            );
        }
    }

    class Captcha extends Component {
        render() {
            return (
                <Recaptcha sitekey="6LckCFAUAAAAAEI2bxdp4VjHnVBuFBht92nIhu8b" />
            )
        }
    }

    class LoginModal extends Component {


        render() {
            return (
                <div className="login-box">
                    <div className="row collapse expanded">
                        <div className="small-12 medium-6 column small-order-2 medium-order-1">
                            <div className="login-box-form-section">
                                <form id="form-login">
                                    <h1 className="login-box-title">Login</h1>
                                    <p className="warning"></p>
                                    <input id="login-email" className="login-box-input" type="email" name="email" placeholder="E-mail" required pattern="\S+" />
                                    <input id="login-password" className="login-box-input" type="password" name="password" placeholder="Password" required pattern="\S+" />
                                    <div className="captcha"><Captcha /></div>
                                    <br />
                                    <input className="login-box-submit-button" type="submit" name="signup_submit" value="Login" />

                                </form>
                            </div>
                            <div className="or">OR</div>
                        </div>
                        <SocialMedia />
                    </div>
                    <CloseButton />
                </div>
            );
        }
    }

    class SignUpModal extends Component {

        render() {
            return (
                <div id="signup" className="login-box">
                    <div className="row collapse expanded">
                        <div className="small-12 medium-6 column small-order-2 medium-order-1">
                            <div className="login-box-form-section">
                                <form id="form-registration">
                                    <h1 className="login-box-title">Sign up</h1>
                                    <p className="warning"></p>
                                    <input id="signup-username" className="login-box-input" type="text" name="username" placeholder="Username" required pattern="\S+"/>
                                    <input id="signup-email" className="login-box-input" type="email" name="email" placeholder="E-mail" required pattern="\S+"/>
                                    <input id="signup-password" className="login-box-input" type="password" name="password" placeholder="Password" required pattern="\S+"/>
                                    <input id="signup-repassword" className="login-box-input" type="password" name="password2" placeholder="Retype password" required pattern="\S+"/>
                                    <p id="warn-password" className="hide">Your password does not match</p>
                                    <div className="captcha"><Captcha /></div>
                                    <br />
                                    <input className="login-box-submit-button" type="submit" name="signup_submit" value="Sign me up" />
                                </form>
                            </div>
                            <div className="or">OR</div>
                        </div>
                        <SocialMedia />
                    </div>
                    <CloseButton />
                </div>
            );
        }
    }

    class SocialMedia extends Component {

        constructor(props) {
            super(props);
            this.state = {
                clientId: "340941719865-nluen8ujll66mu8tst55ebj7ee46gsa9.apps.googleusercontent.com", //dev
                // clientId: "340941719865-82etc6cjnlqrd2vd45v832q4j5v5ibbq.apps.googleusercontent.com", //prod

                style: {
                    display: 'inline-block',
                    background: '#d14836',
                    color: '#fff',
                    width: 500,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 2,
                    border: '1px solid transparent',
                    fontSize: 16,
                    fontWeight: 500
                }
            }
        }

        onSignIn(googleUser) {

            var id_token = googleUser.getAuthResponse().id_token;
            api.sendGoogleToken(id_token, function (err, res) {
                if (err) console.error(err);
                window.location.href = "/";
            })

        }

        render() {
            return (
                <div className="small-12 medium-6 column small-order-1 medium-order-2 login-box-social-section">
                    <div className="login-box-social-section-inner">
                        <span className="login-box-social-headline">Sign in with
                <br />your social network</span>
                        <GoogleLogin
                            clientId={this.state.clientId}
                            onSuccess={this.onSignIn}
                            style={this.state.style}
                        // onFailure={responseGoogle}
                        />
                    </div>
                </div>
            );
        }
    }

    module.exports = {
        SignUpModal: SignUpModal,
        LoginModal: LoginModal
    }
})();