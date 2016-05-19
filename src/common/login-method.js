export function onLogin ({id, token}) {
    this.userId = id;
    this.loggedIn = true;
    return this.storage.set(this.endpoint + "__login_token__", token)
        .then(this.emit.bind(this, "loggedIn", id))
        .then(() => id);
}

export function onLogout () {
    this.userId = null;
    this.loggedIn = false;
    return this.storage.del(this.endpoint + "__login_token__")
        .then(this.emit.bind(this, "loggedOut"))
        .then(() => null);
}

export function resumeLogin () {
    return this.storage.get(this.endpoint + "__login_token__")
        .then(resume => {
            if (!resume) {
                throw new Error("No login token");
            }
            return {resume};
        })
        .then(this.login.bind(this))
        .catch(onLogout.bind(this));
}
