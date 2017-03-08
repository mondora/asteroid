/*
*   The password-login mixin:
*   - defines the `createUser` and `loginWithPassword` methods, porcelain for
*     calling the `createUser` and `login` ddp methods
*/

import {onLogin} from "../common/login-method";

/*
*   Public methods
*/

/**
* @param {Object} options
*   @param {String} username - The username of the user. One of username or email is required.
*   @param {String} email - The email of the user. One of username or email is required.
*   @param {String} password - The password of the user.
*   @param {Object} profile - Additional parameter to save in user profile.
*/
export function createUser (options) {
    return this.call("createUser", options).then(onLogin.bind(this));
}

/**
* @param {Object} options
*   @param {String} username - The username of the user. One of username or email is required.
*   @param {String} email - The email of the user. One of username or email is required.
*   @param {String} id - The id of the user. One of username or email is required.
*   @param {String} password - The password of the user.
*/
export function loginWithPassword ({username, email, password, id}) {
    const loginParameters = {
        password,
        user: {
            username,
            email,
            id
        }
    };
    return this.call("login", loginParameters).then(onLogin.bind(this));
}
