import React, { Component } from 'react';
import { Line as LineChart } from 'react-chartjs-2';
// var LineChart = require("react-chartjs").Line;

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

        // this.componentDidMount = this.componentDidMount.bind(this)
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
                    <img className="thumbnail" src={this.state.data.image} />
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
var config = {};

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

        // this.componentDidMount = this.componentDidMount.bind(this)
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

class Warning extends Component {
    render() {
        return (
            <div className={this.props.className}>
                <p>{this.props.message}</p>
            </div>
        )
    }
}
class Pricepage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tableData: null,
            chartData: null,
            status: null
        }
    }

    componentDidMount() {
        const self = this;
        api.getProductViaUrl(this.props.url, function (err, result) {
            if (err) return console.log(err);

            self.setState({ status: result.status })
        })
    }

    render() {
        if (this.props.url == null) {
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
                    <Product url={this.props.url} />
                    <div id="price-chart">
                        <PriceChart url={this.props.url} />
                        <PriceTable url={this.props.url} />
                    </div>
                </div>
            )

        } else if (this.state.status == "tracked") {
            return (
                <div id="price-history" >
                    <Product url={this.props.url} />
                    <div id="price-chart">
                        <PriceChart url={this.props.url} />
                        <PriceTable url={this.props.url} />
                    </div>
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


export default Pricepage;
