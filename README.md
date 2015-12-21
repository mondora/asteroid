[![Build Status](https://travis-ci.org/mondora/asteroid.svg?branch=master)](https://travis-ci.org/mondora/asteroid)
[![Coverage Status](https://coveralls.io/repos/mondora/asteroid/badge.svg)](https://coveralls.io/r/mondora/asteroid)

# asteroid

A javascript client (node) for a Meteor backend.

## Table of contents

[Why](#why)

[Install](#install)

[Mixin](#available-mixins)

[Example usage](#example-usage)

[Advantages over the canonical Meteor front-end](#advantages-over-the-canonical-meteor-front-end)

[Build asteroid locally](#build-asteroid-locally)

## Why

Meteor is an awesome platform, but its canonical front-end is not very flexible.
Asteroid gives the possibility to connect to a Meteor backend with any JS app.

Some of the things Asteroid allows you to do are:

*	make any existing application reactive

*	use any front-end framework you want with Meteor

*	develop browser extensions backed by Meteor

*   use a Meteor backend for react-native

## Install

Download the package:

```sh
    npm install --save asteroid
```

Require it in your project:

```javascript
    import {createClass} from "asteroid";
```


## Example usage

In this example we use asteroid with the immutable mixin:

```javascript
import {createClass} from "asteroid";

const Asteroid = createClass();
// Connect to a Meteor backend
const asteroid = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});

// Use real-time collections
asteroid.subscribe("tasksPubblication");

asteroid.ddp.on("added", ({collection, id, fields}) => {
    console.log(`Element added to collection ${collection}`);
    console.log(id);
    console.log(fields);
});

// Login with password-login
asteroid.loginWithPassword({username, email, password});

// Call method and use promises
var ret = asteroid.call("newUser");

ret.result
    .then(function (result) {
        console.log("Success: ", result);
    })
    .catch(function (error) {
        console.error("Error: ", error);
    });

```

## Mixin

With the method `createClass`, it's possible to add other mixin to the
base-mixins.

### Available mixins

The mixins now available are:

*   asteroid-immutable-collections-mixin

*   asteroid-oauth-mixinx



## Advantages over the canonical Meteor front-end

* Small footprint.

* Framework agnostic. Use the tools you already know and love to build your app.

* Allows to use Meteor as a full-blown backend or just as a real-time platform
  pluggable into any existing project.

* Easily connect to multiple Meteor servers at the same time, perfect for
  building admin interfaces.


## Build asteroid locally

Clone the repository (or your fork) on your computer.

```sh
    git clone https://github.com/mondora/asteroid.git
```

Enter the project's directory and install the required dependencies:

```sh
    cd asteroid/
    npm install
```

Start the development environment:

```sh
    npm run dev
```

## Contribute

Contributions are as always very very welcome. If you have written some mixin
for asteroid, we can insert it in the asteroid documentation.

## API

## Asteroid methods

### createClass([mixin])

Create the asteroid class, with the base-mixin already in asteroid and any mixin
that you want to add.

##### Arguments

* `mixin` **function** _optional_: the mixin that you want to add

##### Returns

The Asteroid class.

--------------------------------------------------------------------------------

### new Asteroid({endpoint, SocketConstructor, arguments})

Creates a new Asteroid instance, that is, a connection to a
Meteor server (via DDP).

After being constructed, the instance will connect itself to the Meteor backend.
It will also try, upon connection, to resume a previous login session (with a
token saved in localstorage). The `Asteroid.resumeLogin` property stores a
promise which will be resolved if the resume was successful, rejected otherwise.

If `SocketConstructor` is defined, it will be used as the socket transport.
Otherwise `WebSocket` will be used. Note that `SocketConstructor` is required
for IE9 support.

##### Arguments

* `endpoint` **string** _required_: the address of the Meteor server, e.g.
`example.meteor.com`.

* `arguments` **all** _optional_: all the arguments that are needed to the
`init` method of the mixins that you have added.

##### Returns

An Asteroid instance.

------------------------------------------------------------------------------


### createUser({username, email, password})

Creates a user and logs him in. **Does not** hash the password before sending
it to the server. This is not a problem, since you'll probably be using SSL
anyway.

##### Arguments

* `username and/or email` **string** _required_: the username and email.

* `password` **string** _required_: the password.

##### Returns

A promise which will be resolved with the logged user id if the creation and
login are successful. Otherwise it'll be rejected with an error.

------------------------------------------------------------------------------

### loginWithPassword({username, email, password})

Logs the user in username/email and password. **Does not** hash the password
before sending it to the server. This is not a problem, since you'll probably
be using SSL anyway.

##### Arguments

* `username and/or email` **string** _required_: the username and/or email.

* `password` **string** _required_: the password.

##### Returns

A promise which will be resolved with the logged user id if the login is
successful. Otherwise it'll be rejected with an error.

------------------------------------------------------------------------------

### login(params)

Log in the user.

##### Arguments

* `params` **string** _required_: params to pass for login with a custom
provider.

##### Returns

A promise which will be resolved with the logged user id if the login is
successful. Otherwise it'll be rejected with an error.

------------------------------------------------------------------------------

### logout()

Logs out the user.

##### Arguments

None

##### Returns

A promise which will be resolved with if the logout is successful. Otherwise
it'll be rejected with the error.

------------------------------------------------------------------------------
### subscribe(name, [param1, param2, ...])

Subscribes to the specified subscription. If an identical subscription (name
and parameters) has already been made, Asteroid will return that subscription.

##### Arguments

* `name` **string** _required_: the name of the subscription.

* `param1, param2, ...` _optional_: a list of parameters
  that will be passed to the publish function on the server.

##### Returns

A subscription instance.

------------------------------------------------------------------------------
### unsubscribe(id)

Subscription instances have the following properties:

##### Arguments

* `id` **string** _required_: the `id` of the subscription, as
  returned by the `ddp.sub` method

##### Returns

Sends the ddp `unsub` message and deletes the subscription so it can be
garbage collected.

------------------------------------------------------------------------------

### call(method, [param1, param2, ...])

Calls a server-side method with the specified arguments.

##### Arguments

* `method` **string** _required_: the name of the method to call.

* `param1, param2, ...` _optional_: a list of parameters that will be passed
to the method on the server.

##### Returns

An object with two properties: `result` and `updated`. Both properties are
promises.

If the method is successful, the `result` promise will be resolved with the
return value passed by the server. The `updated` promise will be resolved with
nothing once the server emits the `updated` message, that tells the client
that any side-effect that the method execution caused on the database has been
reflected on the client (for example, if the method caused the insertion of an
item into a collection, the client has been notified of said insertion).

If the method fails, the `result` promise will be rejected with the error
returned by the server. The `updated` promise will be rejected as well (with
nothing).

------------------------------------------------------------------------------

### apply(method, params)

Same as `call`, but using as array of parameters instead of a list.

##### Arguments

* `method` **string** _required_: the name of the method to call.

* `params` **array** _optional_: an array of parameters that will be passed to
the method on the server.

##### Returns

Same as `call`, see above.

------------------------------------------------------------------------------
