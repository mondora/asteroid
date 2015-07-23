import Promise from "promiz";

var genericStorage = {};

export function get (key) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get(key, data => {
                resolve(data[key]);
            });
        } else if (typeof localStorage !== "undefined") {
            resolve(localStorage[key]);
        } else {
            resolve(genericStorage[key]);
        }
    });
}

export function set (key, value) {
    return new Promise(function (resolve) {
        if (typeof chrome !== "undefined" && chrome.storage) {
            var data = {};
            data[key] = value;
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

export function del (key) {
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
