"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.login = login;
exports.logout = logout;
exports.init = init;

var _loginMethod = require("../common/login-method");

/*
*   Public methods
*/

function login(loginParameters) {
    return this.call("login", loginParameters).then(_loginMethod.onLogin.bind(this));
} /*
  *   Login mixin:
  *    - defines the `login` and `logout` methods
  *    - exposes the `userId` and `loggedIn` public properties
  */

function logout() {
    return this.call("logout").then(_loginMethod.onLogout.bind(this));
}

/*
*   Init method
*/

function init() {
    this.userId = null;
    this.loggedIn = false;
    this.ddp.on("connected", _loginMethod.resumeLogin.bind(this));
}