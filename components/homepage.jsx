/*jshint esversion: 6 */
import React, { Component } from 'react';

(function () {
    "use strict";

    class Searchbar extends Component {

        constructor(props) {
            super(props);
            this.searchProduct = this.searchProduct.bind(this);
            this.state = {
                url: null
            }
        }

        searchProduct(e) {

            e.preventDefault();
            var url = document.querySelector("#product-url").value
            url = decodeURI(url).replace(/\s/g, '');
            this.setState({ redirect: true, url: url });
        }

        render() {

            if (this.state.url != null) {
                location.replace("price?url=" + this.state.url);
            }

            return (
                <form className="search-form" onSubmit={this.searchProduct} >
                    <span className="icon-search "></span>
                    <input id="product-url" type="url" className="search-input" name="bestbuylink" placeholder="Enter a BestBuy product URL" required />
                    <input id="product-search" type="submit" className="search-btn" value="Search" />
                </form>
            )
        }
    }

    class Banner extends Component {

        render() {
            return (
                <div className="banner">
                    <div id="search-section">
                        <div className="slogan">
                            <p>Why buy at a higher price? Buy at history low.</p>
                        </div>
                    </div>
                </div>
            );
        }
    };

    class Items extends Component {


        render() {
            const self = this;
            var items = this.props.items.map(function (item) {
                return (
                    <div className="item" key={item._id}>
                        <div className="product">
                            <a href={"/price?url=" + item.url}><img className="thumbnail" src={item.img} /></a>
                            <a className="product-name">{item.name}</a>
                        </div>

                        <div className="price">
                            <div className="price-discount">Discount Price ${item.listedPrice}</div>
                            <div className="price-listed">Previous Price: ${item.listedPrice - item.PriceChange}</div>
                        </div>
                    </div>
                )
            });

            return (<div className="items">{items}</div>)
        }
    };

    class TopDeals extends Component {

        constructor(props) {
            super(props);
            this.state = {
                topDeals: [],
                itemCount: 0,
                index: 0,
                offset: 8
            }

            this.pageNextBtn = this.pageNextBtn.bind(this);
            this.pagePrevBtn = this.pagePrevBtn.bind(this);
            this.Pagination = this.Pagination.bind(this);
        }

        componentDidMount() {
            const self = this;
            api.getTopDeals(self.state.index, function (err, res) {
                if (err) console.log(err);
                self.setState({ topDeals: res});
            });

            api.getTotalTopDeals(function (err, res) {
                if (err) console.error(err);
                self.setState({ itemCount: res })
            });

            document.querySelector(".pagination-next").addEventListener("click", function (e) {
                e.preventDefault();
                self.state.index = self.state.index + self.state.offset;
                api.getTopDeals(self.state.index, function (err, res) {
                    if (err) console.error(err);
                    
                    self.setState({
                        topDeals: res
                    });
                });
            })

            document.querySelector(".pagination-previous").addEventListener("click", function (e) {
                e.preventDefault();
                self.state.index = self.state.index - self.state.offset;
                api.getTopDeals(self.state.index, function (err, res) {
                    if (err) console.error(err);
                    self.setState({ topDeals: res});
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

            if (this.state.index  +  this.state.offset < this.state.itemCount)
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
                <div id="discount-section">
                    <h1>Our Top Deals Today</h1>
                    <Items items={this.state.topDeals} />
                    <this.Pagination />
                </div>
            );
        }
    }

    class Homepage extends Component {

        render() {
            return (
                <div>
                    <div id="banner-section">
                        <Banner />
                    </div>
                    <TopDeals/>
                </div>
            )
        }
    }

    module.exports = {
        Homepage: Homepage,
        Searchbar: Searchbar
    }
})();