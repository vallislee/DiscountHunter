/*jshint esversion: 6 */

var ajax = (function(){
    "use strict";
    var module = {};

    module.sendFiles = function (method, url, data, callback){
        var formdata = new FormData();
        Object.keys(data).forEach(function(key){
            var value = data[key];
            formdata.append(key, value);
        });
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else if (callback) callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    };
    
    module.send = function (method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (!callback) return;
            if (xhr.status !== 200) callback(xhr.responseText, null);
            else if (callback) callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    };

    return module;
})();