/*jshint esversion: 6 */
import React, { Component } from 'react';
import {Link, Redirect} from 'react-router-dom';

"use strict";

class Banner extends Component {

    constructor(props) {
        super(props);
        this.searchProduct = this.searchProduct.bind(this);
      }

    searchProduct(e) {
        e.preventDefault();
        this.props.setURL(document.querySelector("#product-url").value);
        this.setState({redirect: true});
    }

    render() {
        if (this.state != null) {
            return <Redirect push to="/price" />;
        }
        return (
            <div className="banner">
                <div id="search-section">
                    <div className="slogan">
                        <p>Why buy at a higher price? Buy at history low.</p>
                    </div>
                    <form className="search-form" onSubmit={this.searchProduct} >
                        <span className="icon-search "></span>
                        <input id="product-url" type="url" className="search-input" name="bestbuylink" placeholder="Enter a retailer URL" required />
                        <input id="product-search" type="submit" className="search-btn" value="Search"/>
                    </form>
                </div>
            </div>
        );
    }
};

class Item extends Component {
    render() {
        return (
            <div className="item">
                <div className="product">
                    <img className="thumbnail" src={this.props.thumbnail} />
                    <a className="product-name">Sharp 43" 1080p LED Roku Smart TV (LC-43LB481C) - Only at Best Buy</a>
                </div>

                <div className="price">
                    <div className="price-discount">$29.99</div>
                    <div className="price-listed">$59.99</div>
                </div>
            </div>
        )
    }
};

class Homepage extends Component {

    render() {
        return (
            <div>
                <div id="banner-section">
                    <Banner setURL={this.props.setURL}/>
                </div>

                <div id="discount-section">
                    <h1>Our Top Deals Today</h1>
                    <div className="items">
                        <Item thumbnail="/thumbnails/01.jpg" />
                        <Item thumbnail="/thumbnails/02.jpg" />
                        <Item thumbnail="/thumbnails/03.jpg" />
                        <Item thumbnail="/thumbnails/04.jpg" />
                        <Item thumbnail="/thumbnails/05.jpg" />
                        <Item thumbnail="/thumbnails/06.jpg" />
                        <Item thumbnail="/thumbnails/07.jpg" />
                        <Item thumbnail="/thumbnails/08.jpg" />
                    </div>
                </div>
            </div>
        )
    }
}

export default Homepage;