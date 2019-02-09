/*jshint esversion: 6 */
import React, { Component } from 'react';
var Warning = require('./warning.jsx').Warning;

(function () {

    "use strict";
    class ContactUsPage extends Component {

        constructor(props){
            super(props);
            this.state = {
                className: "",
                message: ""
            }
        }

        componentDidMount() {
            var contactUsForm = document.querySelector(".contact-us-form")
            const self = this;
            contactUsForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var username = document.querySelector("form [name=username]").value;
                var email = document.querySelector("form [name=email]").value;
                var message = document.querySelector("textarea").value;
    
                api.sendFeedback(username, email, message, function (err, res) {
                    if (err) return self.setState({className:"callout alert", message: err})
                    self.setState({className:"callout success", message: "Thankyou for reachout to us."})
                    contactUsForm.reset();
                })


            })
        }

        render() {
            return (
                <section className="contact-us-section">
                    <Warning className={this.state.className} message={this.state.message}/>
                    <h1 className="contact-us-header">Mail Us</h1>
                    <form className="contact-us-form">
                        <input type="text" name="username" placeholder="Full name" />
                        <input type="email" name="email" placeholder="Email" />
                        <textarea name="message" rows="12" placeholder="Type your message here" required></textarea>
                        <div className="contact-us-form-actions">
                            <input type="submit" className="button" value="Send it" />
                        </div>
                    </form>
                </section>
            );
        }
    }
    module.exports = {
        ContactUsPage: ContactUsPage
    }
})();
