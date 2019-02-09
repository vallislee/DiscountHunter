/*jshint esversion: 6 */

var api = (function(){
    "use strict";
    var module = {};

    module.signup = function(username, email, password,captcha, callback){
        ajax.send("POST", '/api/local/signup', {username:username, email:email, password:password, captcha:captcha}, callback);
    }

    module.signin = function(email, password, captcha, callback){
        ajax.send("POST", '/api/local/signin', {email:email, password:password, captcha:captcha}, callback);
    }

    module.signout = function(){
        ajax.send("GET", '/api/users/signout', null, null);
    }

    module.getProductViaUrl = function(url, callback){
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

    module.sendGoogleToken = function(token, callback){
        ajax.send("POST", '/oauth/google/sigin/', {token:token}, callback);
    }

    module.trackPriceForNonSignedInUser = function(url, desirePrice, email, callback){
        ajax.send("POST", '/api/nonsigned/tracking', {url:url, desire_price:desirePrice, email:email}, callback);
    }

    module.trackPriceForSignedInUser = function(url, desirePrice, callback){
        ajax.send("POST", '/api/signed/tracking', {url:url, desire_price:desirePrice}, callback);
    }

    module.getCurrentUser = function(){
        return document.cookie.match(new RegExp('username=([^;]+)'));
    };

    module.getTrackedItems = function(offset=0, callback){
        ajax.send("GET", '/api/user/tracked/?offset=' + offset, null, callback);
    }

    module.getTotalTrackedItems = function(callback){
        ajax.send("GET", '/api/user/tracked/num', null, callback);
    }

    module.getTopDeals = function(offset=0, callback){
        ajax.send("GET", '/api/products/deals/?offset=' + offset, null, callback);
    }

    module.getTotalTopDeals = function(callback){
        ajax.send("GET", '/api/products/deals/num', null, callback);
    }

    module.sendFeedback = function(name, email, message, callback){
        ajax.send("POST", '/api/user/feedback/', {email:email, name:name, message:message}, callback);
    }

    module.deleteTracking = function(id ,callback){
        ajax.send("DELETE", '/api/signed/tracking/' + id, null, callback);
    }
    
    return module;
})();