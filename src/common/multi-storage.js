const genericStorage = {};


var Storage = function () {
    this.browser = null;
};

Storage.prototype = {
    setBrowser: function (browser) {
        this.browser = browser;
    },
    get: function (key) {
        this.browser.get(key);
    },
    set: function (key, value) {
        this.browser.set(key, value);
    },
    del: function (key) {
        this.browser.del(key);
    }
};


var Chrome = function (resolve) {
    this.get = function (key) {
        chrome.storage.local.get(key, data => resolve(data[key]));
    };
    this.set = function (key, value) {
        const data = {
            [key]: value
        };
        chrome.storage.local.set(data, resolve());
    };
    this.del = function (key) {
        chrome.storage.local.remove(key, resolve());
    };
};

var Local = function (resolve) {
    this.get = function (key) {
        resolve(localStorage[key]);
    };
    this.set = function (key, value) {
        localStorage[key] = value;
        resolve();
    };
    this.del = function (key) {
        delete localStorage[key];
        resolve();
    };
};

var Async = function (resolve, reject) {
    this.get = function (key) {
        AsyncStorage.getItem(key, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    };
    this.set = function (key, value) {
        AsyncStorage.setItem(key, value, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    };
    this.del = function (key) {
        AsyncStorage.removeItem(key, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    };
};

var Generic = function (resolve) {
    this.get = function (key) {
        resolve(genericStorage[key]);
    };
    this.set = function (key, value) {
        genericStorage[key] = value;
        resolve();
    };
    this.del = function (key) {
        delete genericStorage[key];
        resolve();
    };
};

function BrowserFactory () {
    this.create = function (resolve, reject) {
        var browser;
        if (typeof chrome !== "undefined" && chrome.storage) {
            browser = new Chrome(resolve);
        } else if (typeof localStorage !== "undefined") {
            browser = new Local(resolve);
        } else if (typeof AsyncStorage !== "undefined") {
            browser = new Async(resolve, reject);
        } else {
            browser = new Generic(resolve);
        }
        return browser;
    };
}


export function get (key) {
    return new Promise((resolve, reject) => {
        var storage = new Storage();
        storage.setBrowser(new BrowserFactory().create(resolve, reject));
        storage.get(key);
    });
}

export function set (key, value) {
    return new Promise((resolve, reject) => {
        var storage = new Storage();
        storage.setBrowser(new BrowserFactory().create(resolve, reject));
        storage.set(key, value);
    });
}

export function del (key) {
    return new Promise((resolve, reject) => {
        var storage = new Storage();
        storage.setBrowser(new BrowserFactory().create(resolve, reject));
        storage.del(key);
    });
}