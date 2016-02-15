/*
*   Login mixin:
*    - defines the `login` and `logout` methods
*    - exposes the `userId` and `loggedIn` public properties
*/

import {onLogin, onLogout, resumeLogin} from "../common/login-method";

/*
*   Public methods
*/

export function login (loginParameters) {
    return this.call("login", loginParameters).then(onLogin.bind(this));
}

export function logout () {
    return this.call("logout").then(onLogout.bind(this));
}

/*
*   Init method
*/

export function init () {
    this.userId = null;
    this.loggedIn = false;
    this.ddp.on("connected", resumeLogin.bind(this));
}
