var Promise = require("promiz");

var genericStorage = {};

exports.get = function get (key) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get(key, function (data) {
                resolve(data[key]);
            });
        } else if (typeof localStorage !== "undefined") {
            resolve(localStorage[key]);
        } else {
            resolve(genericStorage[key]);
        }
    });
};

exports.set = function set (key, value) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            var data = {};
            data[key] = value;
            chrome.storage.local.set(data, function () {
                resolve();
            });
        } else if (typeof localStorage !== "undefined") {
            localStorage[key] = value;
            resolve();
        } else {
            genericStorage[key] = value;
            resolve();
        }
    });
};

exports.del = function del (key) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.remove(key, function () {
                resolve();
            });
        } else if (typeof localStorage !== "undefined") {
            delete localStorage[key];
            resolve();
        } else {
            delete genericStorage[key];
            resolve();
        }
    });
};
