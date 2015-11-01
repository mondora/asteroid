/*
*   Login mixin:
*    - defines the `login` and `logout` methods
*    - exposes the `userId` and `loggedIn` public properties
*/

import * as multiStorage from "../lib/multi-storage.js";

/*
*   Private methods: they are invoked with the asteroid instance as context, but
*   they are not exported so they don't clutter the Asteroid class prototype.
*/

function onLogin ({id, token}) {
    this.userId = id;
    this.loggedIn = true;
    return multiStorage.set(this.endpoint + "__login_token__", token)
        .then(this.emit.bind(this, "loggedIn"));
}

function onLogout () {
    this.userId = null;
    this.loggedIn = false;
    return multiStorage.del(this.endpoint + "__login_token__")
        .then(this.emit.bind(this, "loggedOut"));
}

function resumeLogin () {
    return multiStorage.get(this.endpoint + "__login_token__")
        .then(resume => {
            if (!resume) {
                throw new Error("No login token");
            }
            return {resume};
        })
        .then(this.login.bind(this))
        .then(onLogin.bind(this))
        .catch(onLogout.bind(this));
}

/*
*   Public methods
*/

export function login (loginParameters) {
    return this.call("login", loginParameters)
        .then(onLogin.bind(this));
}

export function logout () {
    return this.call("logout")
        .then(onLogout.bind(this));
}

/*
*   Init method
*/

export function init () {
    this.userId = null;
    this.loggedIn = false;
    this.ddp.on("connected", resumeLogin.bind(this));
}
