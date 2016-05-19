"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onLogin = onLogin;
exports.onLogout = onLogout;
exports.resumeLogin = resumeLogin;
function onLogin(_ref) {
    var id = _ref.id;
    var token = _ref.token;

    this.userId = id;
    this.loggedIn = true;
    return this.storage.set(this.endpoint + "__login_token__", token).then(this.emit.bind(this, "loggedIn", id)).then(function () {
        return id;
    });
}

function onLogout() {
    this.userId = null;
    this.loggedIn = false;
    return this.storage.del(this.endpoint + "__login_token__").then(this.emit.bind(this, "loggedOut")).then(function () {
        return null;
    });
}

function resumeLogin() {
    return this.storage.get(this.endpoint + "__login_token__").then(function (resume) {
        if (!resume) {
            throw new Error("No login token");
        }
        return { resume: resume };
    }).then(this.login.bind(this)).catch(onLogout.bind(this));
}