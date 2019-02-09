/*jshint esversion: 6 */
import React, { Component } from 'react';

(function () {
    "use strict";

    class CreditsPage extends Component {
        render() {
            return (
                <div>
                    <h1>Credits</h1>
                    <h2>Icons</h2>
                    <ul>
                        <li>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></li>
                        <li>Background Photo from  by <a href="https://unsplash.com/photos/7vGOt_hKU14">Yuriy Trubitsyn on Unsplash</a></li>
                    </ul>
                    <h2>HTML, CSS and Javascript code</h2>
                    <ul>
                        <li>What would I do without <a href="http://stackoverflow.com/">Stackoverflow</a></li>
                        <li><a href="https://foundation.zurb.com/sites.html">Foundation</a></li>
                        <li><a href="https://www.w3schools.com/">W3School</a></li>
                    </ul>
                </div>
            )
        }
    }

    module.exports = {
        CreditsPage: CreditsPage
    }
})();