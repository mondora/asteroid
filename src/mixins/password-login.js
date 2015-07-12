import multiStorage from "../lib/multi-storage.js";

function _login (result) {
    this.userId = result.id;
    this.loggedIn = true;
    return multiStorage.set(this.endpoint + "__login_token__", result.token)
        .then(() => {
            this.emit("loggedIn");
        });
}

function _logout () {
    this.userId = null;
    this.loggedIn = false;
    return multiStorage.del(this.endpoint + "__login_token__")
        .then(() => {
            this.emit("loggedOut");
        });
}

function _resumeLogin () {
    return multiStorage.get(this.endpoint + "__login_token__")
        .then(resume => {
            if (!resume) {
                throw "No login token";
            }
            return {resume};
        })
        .then(loginParameters => {
            return this.call("login", loginParameters);
        })
        .then(_login.bind(this))
        .catch(_logout.bind(this));
}

export function init () {
    this.userId = null;
    this.loggedIn = false;
    this.ddp.on("connected", _resumeLogin.bind(this));
}

export function createUser (options) {
    return this.call("createUser", options).then(_login(this));
}

export function login ({email, password, username}) {
    var loginParameters = {
        password,
        user: {
            username,
            email
        }
    };
    return this.call("login", loginParameters).then(_login(this));
}

export function logout () {
    return this.call("logout").then(_logout(this));
}
