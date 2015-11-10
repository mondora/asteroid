import * as multiStorage from "../lib/multi-storage.js";

export function onLogin ({id, token}) {
    this.userId = id;
    this.loggedIn = true;
    return multiStorage.set(this.endpoint + "__login_token__", token)
        .then(this.emit.bind(this, "loggedIn", id));
}

export function onLogout () {
    this.userId = null;
    this.loggedIn = false;
    return multiStorage.del(this.endpoint + "__login_token__")
        .then(this.emit.bind(this, "loggedOut"));
}

export function resumeLogin () {
    return multiStorage.get(this.endpoint + "__login_token__")
        .then(resume => {
            if (!resume) {
                throw new Error("No login token");
            }
            return {resume};
        })
        .then(this.login.bind(this))
        .catch(onLogout.bind(this));
}
