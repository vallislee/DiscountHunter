/*jshint esversion: 6 */
import React, { Component } from 'react';

(function () {

    "use strict";

    class UserCard extends Component {

        render() {
            return (
                <div id="user-info">
                    <span className="icon-profile" />
                    <h3>{this.props.name}</h3>
                    <p>{this.props.email}</p>
                </div>
            );
        }
    }

    class TrackingList extends Component {

        constructor(props) {
            super(props);

            this.items = this.items.bind(this);
            this.deleteTracking = this.deleteTracking.bind(this);
            this.items = this.items.bind(this);
        }

        deleteTracking(id) {

            api.deleteTracking(id, function (err, res) {
                if (err) return console.error(err);
                document.getElementById(id).remove();
                return console.log(res);
            })
        }

        items() {
            const self = this;
            var items = this.props.items.map(function (item) {
                return (
                    <tr key={item._id} id={item._id}>
                        <td><a href={"/price?url=" + item.url} target="_blank">{item.product_name}</a></td>
                        <td >${item.desire_price}</td>
                        <td>
                            <span className="icon-delete clickable" title="Delete" onClick={() => self.deleteTracking(item._id)}></span>
                        </td>
                    </tr>
                );
            })


            return (<tbody>{items}</tbody>);
        }

        render() {

            return (
                <div id="user-tracking">
                    <h3>Tracking Cart</h3>
                    <table className="hover">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Desire Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <this.items />
                    </table>
                </div>
            );
        }
    }

    class ProfilePage extends Component {

        constructor(props) {
            super(props);
            this.state = {
                username: "N/A",
                email: "N/A",
                trackedItems: [],
                itemCount: 0,
                infoValid: false,
                index: 0,
                offset: 10
            }

            this.pageNextBtn = this.pageNextBtn.bind(this);
            this.pagePrevBtn = this.pagePrevBtn.bind(this);
            this.Pagination = this.Pagination.bind(this);
        }

        componentDidMount() {
            const self = this;
            api.getTrackedItems(this.state.index, function (err, res) {
                if (err) console.error(err);
                self.setState({
                    username: res[0],
                    email: res[1],
                    trackedItems: res[2],
                    infoValid: true
                });
            });

            api.getTotalTrackedItems(function (err, res) {
                if (err) console.error(err);
                self.setState({ itemCount: res })
            });

            document.querySelector(".pagination-next").addEventListener("click", function (e) {
                self.state.index = self.state.index + self.state.offset
                api.getTrackedItems(self.state.index, function (err, res) {
                    if (err) console.error(err);
                    self.setState({
                        username: res[0],
                        email: res[1],
                        trackedItems: res[2],
                        infoValid: true
                    });
                });
            })

            document.querySelector(".pagination-previous").addEventListener("click", function (e) {
                self.state.index = self.state.index - self.state.offset;
                api.getTrackedItems(self.state.index, function (err, res) {
                    if (err) console.error(err);
                    self.setState({ username: res[0], email: res[1], trackedItems: res[2], infoValid: true });
                });
            })


        }

        Pagination() {
            return (
                <nav aria-label="Pagination">
                    <ul className="pagination text-center">
                        <this.pagePrevBtn />
                        <this.pageNextBtn />
                    </ul>
                </nav>
            )
        }

        pageNextBtn() {

            if (this.state.index  +  this.state.offset  < this.state.itemCount)
                return (<li className="pagination-next "><a href="#" aria-label="Next page">Next</a></li>);

            return (<li className="pagination-next disabled">Next</li>)
        }

        pagePrevBtn() {
            if (this.state.index - this.state.offset >= 0)
                return (<li className="pagination-previous "><a href="#" aria-label="Previous page">Previous</a></li>);

            return (<li className="pagination-previous disabled">Previous</li>)
        }

        render() {
            return (
                <div id="user-profile">
                    <UserCard name={this.state.username} email={this.state.email} />
                    <TrackingList items={this.state.trackedItems} />
                    <this.Pagination />
                </div>
            )
        }
    }

    module.exports = {
        ProfilePage: ProfilePage
    }

})();
 