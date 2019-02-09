/*jshint esversion: 6 */

import React, { Component } from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import queryString from 'querystring';

var Warning = require('./warning.jsx').Warning;

(function () {

    "use strict";

    class Product extends Component {

        constructor(props) {
            super(props);

            this.state = {
                data: {
                    image: null,
                    name: null,
                    listedPrice: null
                }
            }

        };

        componentDidMount() {
            const self = this;
            api.getProductDetail(this.props.url, function (err, productInfo) {
                if (err) console.debug(err);
                else {
                    self.setState({ data: productInfo });
                }
            })
        }

        render() {
            return (

                <div className="media-object stack-for-small align-center product">

                    <div className="media-object-section">
                        <a href={this.props.url} target="_blank">
                            <img className="thumbnail" src={this.state.data.image} />
                        </a>
                    </div>
                    <div className="media-object-section description">
                        <h4>{this.state.data.name}</h4>
                        <div className="price">
                            <div className="price-discount">Listed price: {this.state.data.listedPrice} </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    class PriceChart extends Component {

        constructor(props) {
            super(props);

            this.state = {
                data: {  //from https://github.com/jerairrest/react-chartjs-2
                    labels: [],
                    datasets: [
                        {
                            label: 'BestBuy',
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: 'rgba(75,192,192,0.4)',
                            borderColor: 'rgba(75,192,192,1)',
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: 'rgba(75,192,192,1)',
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                            pointHoverBorderColor: 'rgba(220,220,220,1)',
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: []
                        }
                    ]
                }
            }
        }

        componentDidMount() {
            const self = this;
            api.getProductPriceHistory(this.props.url, function (err, productInfo) {
                if (err) console.debug(err);
                else {

                    var data = self.state.data;
                    for (var i = 0; i < productInfo.length; i++) {
                        data.labels.push(productInfo[i][1]);
                        data.datasets[0].data.push(productInfo[i][0]);
                    };
                    self.setState({ data: data });
                }
            })
        }

        render() {

            return (
                <div className="chart-container">
                    <LineChart data={this.state.data} redraw={true} />
                </div>
            )
        }
    }

    class PriceTableRow extends Component {
        render() {
            return (
                <tr>
                    <td>{this.props.type}</td>
                    <td>{this.props.price}</td>
                    <td>{this.props.date}</td>
                </tr>
            )
        }
    }
    class PriceTable extends Component {

        constructor(props) {
            super(props);

            this.state = {
                data: null
            }
        };

        componentDidMount() {
            const self = this;
            api.getProductPrice(this.props.url, function (err, productInfo) {
                if (err) console.debug(err);
                else {
                    self.setState({ data: productInfo });
                }
            })
        }

        render() {

            return (<div>
                <h4>Price History</h4>
                <table className="unstriped">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    {this.state && this.state.data &&
                        <tbody>
                            <PriceTableRow type="Current Price" price={this.state.data.current[0]} date={this.state.data.current[1]} />
                            <PriceTableRow type="Highest Price" price={this.state.data.maximun[0]} date={this.state.data.maximun[1]} />
                            <PriceTableRow type="Lowerest Price" price={this.state.data.minmum[0]} date={this.state.data.minmum[1]} />
                            <PriceTableRow type="Median Price" price={this.state.data.median[0]} date={this.state.data.median[1]} />
                        </tbody>
                    }

                </table>
            </div>);
        }

    }

    class EmailNotification extends Component {
        constructor(props) {
            super(props);
            this.trackProductNonSignIn = this.trackProductNonSignIn.bind(this);
            this.trackProductSignIn = this.trackProductSignIn.bind(this);
            this.NotifyUser = this.NotifyUser.bind(this);
        }

        NotifyUser(err, res) {
            if (err) document.querySelector("#tracking-form .warning").innerHTML = err;
            document.querySelector("#tracking-form .warning").innerHTML = "We will notify you when price drop below your desire price";
            document.getElementById("tracking-form").reset();
        }

        trackProductNonSignIn() {
            const self = this;
            var desirePrice = document.querySelector("#tracking-form [name=price]").value;
            var email = document.querySelector("#tracking-form [name=email]").value;

            var url = this.props.url;

            api.trackPriceForNonSignedInUser(url, desirePrice, email, function (err, res) {
                self.NotifyUser(err, res);
            })
        }

        trackProductSignIn() {
            const self = this;
            var desirePrice = document.querySelector("#tracking-form [name=price]").value;
            var url = this.props.url;
            api.trackPriceForSignedInUser(url, desirePrice, function (err, res) {
                self.NotifyUser(err, res);
            })
        }

        emailInput() {

            if (api.getCurrentUser() != null) {
                return (<div></div>);
            }
            return (
                <div id="notify-email" className="floated-label-wrapper">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="eg. Alice@Dhunter.com" required />
                </div>
            )
        }

        desirePriceInput() {

            return (
                <div className="floated-label-wrapper">
                    <label>Desire Price</label>
                    <input type="text" name="price" pattern="[0-9]*.?[0-9]{0,2}" placeholder="eg. 99.99" required />
                </div>
            )
        }

        componentDidMount() {

            var notifyForm = document.getElementById("tracking-form");
            var trackProduct = this.trackProductNonSignIn;

            if (api.getCurrentUser() != null) {
                trackProduct = this.trackProductSignIn;
            }

            return notifyForm.addEventListener("submit", function (e) {
                e.preventDefault();
                trackProduct();
            })

        }

        render() {
            return (
                <form id="tracking-form" className="callout text-center">
                    <h5>Notify Me At Desire Price</h5>
                    <p className="warning"></p>
                    <br />
                    <this.desirePriceInput />
                    <this.emailInput />
                    <input className="button expanded" type="submit" value="Track" />
                </form>
            )
        }
    }

    class Pricepage extends Component {

        constructor(props) {
            super(props);
            this.state = {
                tableData: null,
                chartData: null,
                status: null,
                url: null
            }
        }

        componentWillMount() {

            var url = queryString.parse(location.search.slice(1)).url;
            this.state.url = url;

            const self = this;
            api.getProductViaUrl(this.state.url, function (err, result) {
                if (err) return self.setState({ status: "invalid" });   

                self.setState({ status: result.status })
            })
        }

        render() {

            if (this.state.url == null) {
                return (
                    <div id="price-history" >
                        <Warning className="callout alert" message="No URL was provided." />
                    </div>
                )

            }

            if (this.state.status == "added") {
                return (
                    <div id="price-history" >
                        <Warning className="callout success" message="The product was not previsouly tracked. But we are tracking it now!!!" />
                        <Product url={this.state.url} />
                        <div id="price-chart">
                            <PriceChart url={this.state.url} />
                            <div>
                                <PriceTable url={this.state.url} />
                                <EmailNotification url={this.state.url} />
                            </div>
                        </div>

                    </div>
                )

            } else if (this.state.status == "tracked") {
                return (
                    <div id="price-history" >
                        <Product url={this.state.url} />
                        <div id="price-chart">
                            <PriceChart url={this.state.url} />
                            <div>
                                <PriceTable url={this.state.url} />
                                <EmailNotification url={this.state.url} />
                            </div>
                        </div>

                    </div>
                )
            } else if (this.state.status == "invalid") {
                return (
                    <div id="price-history" >
                        <Warning className="callout alert" message="Invalid URL was provided." />
                    </div>
                )
            } else
                return (
                    <div id="price-history" >
                        <Warning className="callout secondary" message="Loading" />
                    </div>
                )
        }
    }

    module.exports = {
        Pricepage: Pricepage
    }
})();
