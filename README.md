[![npm version](https://badge.fury.io/js/asteroid.svg)](https://badge.fury.io/js/asteroid)
[![Build Status](https://travis-ci.org/mondora/asteroid.svg?branch=master)](https://travis-ci.org/mondora/asteroid)
[![Coverage Status](https://img.shields.io/coveralls/mondora/asteroid.svg)](https://coveralls.io/r/mondora/asteroid?branch=master)
[![Dependency Status](https://david-dm.org/mondora/asteroid.svg)](https://david-dm.org/mondora/asteroid)
[![devDependency Status](https://david-dm.org/mondora/asteroid/dev-status.svg)](https://david-dm.org/mondora/asteroid#info=devDependencies)

# asteroid

A javascript client (node) for a Meteor backend.

## Why

Meteor is an awesome framework for building real-time APIs. Its canonical
front-end framework however is not very flexible. Adopting other front-ends
comes with the cost of having to work around the limitations of meteor's build
tool, which makes it very difficult, for instance, to use other tools like
webpack, or to manage dependencies via `npm`.

Asteroid is an isomorphic/universal javascript library which allows to connect
to a Meteor backend from almost any JS environment.

With Asteroid you can:
* hook any existing application to a real-time meteor API
* use any front-end framework you want with a Meteor backend
* develop browser extensions backed by Meteor
* use Meteor as a backend for a react-native app

### Advantages over the canonical Meteor front-end

* Small footprint
* Framework agnostic. Use the tools you already know and love to build your app
* Allows to use Meteor as a full-blown backend or just as a real-time platform
  pluggable into any existing project
* Easily connect to multiple Meteor servers at the same time, perfect for
  building admin interfaces

## Install

    npm install --save asteroid

## Usage

```js
import {createClass} from "asteroid";

const Asteroid = createClass();
// Connect to a Meteor backend
const asteroid = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});

// Use real-time collections
asteroid.subscribe("tasksPublication");

asteroid.ddp.on("added", ({collection, id, fields}) => {
    console.log(`Element added to collection ${collection}`);
    console.log(id);
    console.log(fields);
});

// Login
asteroid.loginWithPassword({username, email, password});

// Call method and use promises
asteroid.call("newUser")
    .then(result => {
        console.log("Success");
        console.log(result);
    })
    .catch(error => {
        console.log("Error");
        console.error(error);
    });
```

## Mixins

Mixins are used to extend Asteroid's functionalities. You add mixins by passing
them to the `createClass` function.

A mixin is an object with a set of enumerable function properties. Those
functions will all be mixed into `Asteroid.prototype`. The special function
`init` won't end up the in `prototype`. Instead it will be called on
instantiation with the arguments passed to the constructor.

### Included mixins

* `ddp`: establishes the ddp connection
* `methods`: adds methods for invoking ddp remote methods
* `subscriptions`: adds methods for subscribing to ddp publications
* `login`: adds methods for logging in
* `password-login`: adds methods for password logins / user creation

### Third-party mixins

* [asteroid-immutable-collections-mixin](https://github.com/mondora/asteroid-immutable-collections-mixin):
  stores collections published by the server into an immutable map
* [asteroid-oauth-mixinx](https://github.com/mondora/asteroid-oauth-mixin):
  allows logging in via oauth

## Development environment setup

After cloning the repository, install `npm` dependencies with `npm install`.
Run `npm test` to run unit tests, or `npm run dev` to have `mocha` re-run your
tests when source or test files change.

## Contribute

Contributions are as always very welcome. If you have written a mixin for
asteroid, feel free to make a PR to add it to this README.

## API

### module.createClass([mixins])

Create the `Asteroid` class. Any passed-in mixins will be added to the default
mixins.

##### Arguments

* `mixins` **Array<object>** _optional_: mixins you want to use

##### Returns

The `Asteroid` class.

---

### new Asteroid(options)

Creates a new Asteroid instance (which is also an `EventEmitter`).

On instantiation:
* the `ddp` mixin will automatically connect to the Meteor backend
* the `login` mixin will try to resume a previous session

##### Arguments

* `options` **object** _required_:
  * `endpoint` **string** _required_: the DDP endpoint to connect to, e.g.
    `ws://example.com/websocket`
  * `SocketConstructor` **function** _optional_ [default: `WebSocket`]: the
    class to be used to create the websocket connection to the server. In node,
    use `faye-websocket-node`'s `Client`. In older browsers which do not support
    `WebSocket`, use `sockjs-client`'s `SockJS`
  * `autoConnect` **boolean** _optional_ [default: `true`]: whether to
    auto-connect to the server on instantiation. Otherwise the `connect` method
    can be used to establish the connection
  * `autoReconnect` **boolean** _optional_ [default: `true`]: wheter to
    auto-reconnect when the connection drops for whatever reason. This option
    will be ignored - and the connection won't be re-established - if the
    connection is terminated by calling the `disconnect` method

##### Returns

An Asteroid instance.

---

### connect()

Provided by the `ddp` mixin.

Establishes a connection to the ddp server. No-op if a connection is already
established.

##### Arguments

None.

##### Returns

Nothing.

---

### disconnect()

Provided by the `ddp` mixin.

Terminates the connection to the ddp server. No-op if there's no active
connection.

##### Arguments

None.

##### Returns

Nothing.

---

### call(method, [param1, param2, ...])

Provided by the `methods` mixin.

Calls a server-side method with the specified arguments.

##### Arguments

* `method` **string** _required_: the name of the method to call
* `param1, param2, ...` **...any** _optional_: parameters passed to the server
  method

##### Returns

A promise to the method return value (the promise is rejected if the method
throws).

---

### apply(method, params)

Provided by the `methods` mixin.

Same as `call`, but using as array of parameters instead of a list.

##### Arguments

* `method` **string** _required_: the name of the method to call
* `params` **Array<any>** _optional_: an array of parameters passed to the
  server method

##### Returns

Same as `call`, see above.

---

### subscribe(name, [param1, param2, ...])

Provided by the `subscriptions` mixin.

Subscribes to the specified publication. If an identical subscription (name
and parameters) has already been made, Asteroid will not re-subscribe and
return that subscription instead (subscriptions are idempotent, so it does not
make sense to re-subscribe).

##### Arguments

* `name` **string** _required_: the name of the publication

* `param1, param2, ...` **...any** _optional_: a list of parameters that are
  passed to the publication function on the server

##### Returns

A subscription object. Subscription objects have an `id`, which you can
later use to unsubscribe, and are `EventEmitter`-s. You can listen for the
following events:

* `ready`: emitted without parameters when the subscription is marked as `ready`
  by the server
* `error`: emitted with the error as first and only parameter when the server
  signals an error occurred on the subscription
* **TODO** `stopped`: emitted when the subscription stops

---

### unsubscribe(id)

Provided by the `subscriptions` mixin.

Unsubscribes from a publication.

##### Arguments

* `id` **string** _required_: the `id` of the subscription

##### Returns

Nothing.

---

### createUser(options)

Provided by the `password-login` mixin.

Creates a user and logs him in. **Does not** hash the password before sending
it to the server. This should not be a problem, since you'll probably be using
SSL anyway.

##### Arguments

* `options` **object** _required_:
  * `username` **string** _optional_
  * `email` **string** _optional_
  * `password` **string** _required_

Note: you must specify either `options.username` or `options.email`.

##### Returns

A promise which resolves when the creation succeeds, or rejects when it fails.

---

### loginWithPassword(options)

Provided by the `password-login` mixin.

Logs the user in using username/email and password. **Does not** hash the
password before sending it to the server. This should not be a problem, since
you'll probably be using SSL anyway.

##### Arguments

* `options` **object** _required_:
  * `username` **string** _optional_
  * `email` **string** _optional_
  * `password` **string** _required_

Note: you must specify either `options.username` or `options.email`.

##### Returns

A promise which resolves when the login succeeds, or rejects when it fails.

---

### login(params)

Provided by the `login` mixin.

Log in the user.

##### Arguments

* `params` **object** _required_: params to pass for login with a custom
  provider

##### Returns

A promise which resolves when the login succeeds, or rejects when it fails.

---

### logout()

Provided by the `login` mixin.

Logs out the user.

##### Arguments

None

##### Returns

A promise which resolves when the logout succeeds, or rejects when it fails.

---

### Public `Asteroid` events

* `connected` (emitted by the `ddp` mixin)
* `disconnected` (emitted by the `ddp` mixin)
* `loggedIn` (emitted by the `login` mixin)
* `loggedOut` (emitted by the `login` mixin)
