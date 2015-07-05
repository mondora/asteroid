var multiStorage = require("../lib/multi-storage.js");

var _login = function (asteroid) {
    return function (result) {
        asteroid.userId = result.id;
        asteroid.loggedIn = true;
        return multiStorage.set(asteroid.endpoint + "__login_token__", result.token)
            .then(function () {
                asteroid.emit("loggedIn");
            });
    };
};

var _logout = function (asteroid) {
    return function () {
        asteroid.userId = null;
        asteroid.loggedIn = false;
        return multiStorage.del(asteroid.endpoint + "__login_token__")
            .then(function () {
                asteroid.emit("loggedOut");
            });
    };
};

exports.init = function init () {
    var self = this;
    self.userId = null;
    self.loggedIn = false;
    self._ddp.on("connected", function () {
        self._resumeLogin();
    });
};

exports._resumeLogin = function () {
    var self = this;
    return multiStorage.get(self.endpoint + "__login_token__")
        .then(function (token) {
            if (!token) {
                throw "No login token";
            }
            return {
                resume: token
            };
        })
        .then(function (loginParameters) {
            return self.call("login", loginParameters);
        })
        .then(_login(self))
        .catch(_logout(self));
};

exports.createUser = function createUser (options) {
    return this.call("createUser", options).then(_login(this));
};

exports.login = function login (options) {
    var loginParameters = {
        password: options.password,
        user: {
            username: options.username,
            email: options.email
        }
    };
    return this.call("login", loginParameters).then(_login(this));
};

exports.logout = function logout () {
    return this.call("logout", []).then(_logout(this));
};
