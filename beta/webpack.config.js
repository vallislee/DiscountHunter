var webpack = require("webpack");
var path = require("path");

var DEV = path.resolve(__dirname, "frontend/js/dev");
var OUTPUT = path.resolve(__dirname, "frontend/js/prod");

var app = DEV + "/app.jsx";
var home = DEV + "/homepage.jsx";
var price = DEV + "/pricepage.jsx";

var config = {
    entry: [app, home, price] ,
    output: {
        path: OUTPUT,
        filename: "app.js",
        publicPath: '/'
    },
    module: {
        rules: [{
            include: DEV,
            loader: "babel-loader"
        }]
    },
    mode: "development"
};

module.exports = config;