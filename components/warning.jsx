
/*jshint esversion: 6 */

import React, { Component } from 'react';

(function () {

    "use strict";
    class Warning extends Component {
        render() {
            return (
                <div className={this.props.className}>
                    <p>{this.props.message}</p>
                </div>
            )
        }
    }

    module.exports = {
        Warning: Warning
    }
})();
