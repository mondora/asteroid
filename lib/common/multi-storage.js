"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = get;
exports.set = set;
exports.del = del;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var genericStorage = {};

function get(key) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get(key, function (data) {
                return resolve(data[key]);
            });
        } else if (typeof localStorage !== "undefined") {
            resolve(localStorage[key]);
        } else {
            resolve(genericStorage[key]);
        }
    });
}

function set(key, value) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            var data = _defineProperty({}, key, value);
            chrome.storage.local.set(data, resolve);
        } else if (typeof localStorage !== "undefined") {
            localStorage[key] = value;
            resolve();
        } else {
            genericStorage[key] = value;
            resolve();
        }
    });
}

function del(key) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.remove(key, resolve);
        } else if (typeof localStorage !== "undefined") {
            delete localStorage[key];
            resolve();
        } else {
            delete genericStorage[key];
            resolve();
        }
    });
}