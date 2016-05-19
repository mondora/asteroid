"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createUser = createUser;
exports.loginWithPassword = loginWithPassword;

var _loginMethod = require("../common/login-method");

/*
*   Public methods
*/

function createUser(_ref) {
    var username = _ref.username;
    var email = _ref.email;
    var password = _ref.password;

    var options = {
        password: password,
        user: {
            username: username,
            email: email
        }
    };
    return this.call("createUser", options).then(_loginMethod.onLogin.bind(this));
} /*
  *   The password-login mixin:
  *   - defines the `createUser` and `loginWithPassword` methods, porcelain for
  *     calling the `createUser` and `login` ddp methods
  */

function loginWithPassword(_ref2) {
    var username = _ref2.username;
    var email = _ref2.email;
    var password = _ref2.password;

    var loginParameters = {
        password: password,
        user: {
            username: username,
            email: email
        }
    };
    return this.call("login", loginParameters).then(_loginMethod.onLogin.bind(this));
}