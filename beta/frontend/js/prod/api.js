/*jshint esversion: 6 */

var api = (function(){
    "use strict";
    var module = {};

    module.signup = function(username, password, callback){
        ajax.send("POST", '/api/users/signup', {username:username, password:password}, callback);
    }

    module.signin = function(username, password, callback){
        ajax.send("POST", '/api/users/signin', {username:username, password:password}, callback);
    }

    module.signout = function(){
        ajax.send("GET", '/api/users/signout', null, callback);
    }

    module.getProductViaUrl = function(url, callback){
        console.log(url);
        ajax.send("GET", "/api/products/?url=" + url, null, callback);
    }

    module.getProductViaId = function(id, callback){
        ajax.send("GET", '/api/products/' + id, null, callback);
    }

    module.getProductPrice = function(url, callback){
        ajax.send("GET", '/api/price/?url=' + url  , null, callback);
    }

    module.getProductPriceHistory = function(url, callback){
        ajax.send("GET", '/api/pricehistory/?url=' + url, null, callback);
    }

    module.getProductDetail = function(url, callback){
        ajax.send("GET", '/api/details/?url=' + url, null, callback);
    }

    return module;
})();