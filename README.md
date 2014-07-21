[![Build Status](https://travis-ci.org/mondora/asteroid.svg?branch=master)](https://travis-ci.org/mondora/asteroid)
[![Coverage Status](https://coveralls.io/repos/mondora/asteroid/badge.png)](https://coveralls.io/r/mondora/asteroid)

[Example todo app using AngularJS.](http://mondora.github.io/meteor-todo)
[Same app using Meteor's front-end.](http://meteor.todo.pscanf.com)

#asteroid

A javascript client (browser and node) for a Meteor backend.

##Table of contents

[Why](#why)

[Install](#install)

[Example usage](#example-usage)

[Advantages over the canonical Meteor front-end](#advantages-over-the-canonical-meteor-front-end)

[Build asteroid locally](#build-asteroid-locally)

[Contribute](#contribute)

[Todo](#todo)

[API](#api)

##Why

Meteor is an awesome platform, but its canonical
front-end is not very flexible. Asteroid gives the
possibility to connect to a Meteor backend with any JS app.

Some of the things Asteroid allows you to do are:

*	make any existing application reactive

*	use any front-end framework you want with Meteor

*	develop browser extensions backed by Meteor

[Blog post on the library](http://mondora.com/#!/post/e2da7bd7ccb774de13324488b4e24abd)

##Install

###In the browser

First, dowload the library:

    bower install asteroid

Then, add the necessary libraries to your index.html:

    <script src="bower_components/ddp.js/src/ddp.js"></script>
    <script src="bower_components/q/q.js"></script>
    <script src="bower_components/asteroid/dist/asteroid.js"></script>

###In node

Download the package:

    npm install git+https://github.com/mondora/asteroid

Require it in your project:

    var Asteroid = require("asteroid");

##Example usage

**Warning: the API is in still a bit in flux.**

```javascript
// Connect to a Meteor backend
var ceres = new Asteroid("localhost:3000");

// Use real-time collections
ceres.subscribe("tasks");
var tasks = ceres.getCollection("tasks");
tasks.insert({
  description: "Do the laundry"
});
var laundryTaskQuery = tasks.reactiveQuery({description: "Do the laundry"});
console.log(laundryTaskQuery.result); // Logs the array of results

// Login your user
ceres.loginWithTwitter();
```

##Advantages over the canonical Meteor front-end

* Small footprint. The library is about ~10Kb minified. It
  depends on ddp.js (~4Kb minified), and a q-compatible
  promise library (q is ~17Kb minified, for a lightweight
  alternative, check out my fork of
  [ayepromise](https://github.com/mondora/ayepromise), which
  is ~2Kb minified). In the demo app, the [Asteroid
  client](http://s27.postimg.org/hc1qjnjsz/Asteroid.png),
  which includes AngularJS (not required, but included for
  the demo), is almost half the size of the [Meteor
  client](http://s29.postimg.org/3mxaifziv/Meteor.png).

* Framework agnostic. Use the tools you already know and
  love to build your app.

* Allows to use Meteor as a full-blown backend or just as a
  real-time platform pluggable into any existing project.

* Easily connect to multiple Meteor servers at the same
  time, perfect for building admin interfaces.

 
##Build asteroid locally

Clone the repository (or your fork) on your computer.

    git clone https://github.com/mondora/asteroid

Enter the project's directory and install the required
dependencies:

    cd asteroid/
    npm install
    bower install

For conveninece, I suggest installing a few `npm` modules
globally:

    npm install -g gulp karma mocha

Modfy the source files under `src/` as needed, then rebuild
the distribution files, which will get placed in the `dist/`
directory:

    gulp buildBrowser
    gulp buildNode

You can add your unit tests in one of the files under `test/unit/`
(or you can add another file in that folder if needed).
Once you've added unit tests, you need also to rebuild the
tests:

    gulp buildTests

Now you can run tests. For **nodejs** run:

    mocha test/asteroid.unit.js

For the browser run:

    karma start test/karma.conf.js

You can set up an automated dev environment with automatic
re-builds of source files and tests by running:

    gulp dev
    
This will set up a webserver listening on `localhost:8080`, where
you'll find a report for browser unit tests being run.

##Contribute

Contributions are as always very very welcome. If you
want to help but don't know how to get started,
[feel free to schedule a pair programming session with me!](http://mondora.com/#!/post/4ddde81d13b2152ab068b54e85bd4a2a)

*Contributing guidelines coming soon.*

##Todo

Here follows a list of things which need to be done before
the library can be considered "production ready":

* allow using selectors and modifiers to update an item
  (currently you can only replace top-level fields in the
  document with the Collection.update method). Difficulty
  8/10

* allow using selectors with the reactiveQuery method.
  Difficulty 8/10

* add EJSON support (by porting Meteor's EJSON package).
  Difficulty 3/10

* just an idea, but I'd fancy trying to integrate it with
  [nedb](https://github.com/louischatriot/nedb)





##API



##Asteroid methods



###new Asteroid(host, ssl, interceptor)

Creates a new Asteroid instance, that is, a connection to a
Meteor server (via DDP).

After being constructed, the instance will connect itself to
the Meteor backend. It will also try, upon connection, to
resume a previous login session (with a token saved in
localstorage). The `Asteroid.resumeLoginPromise` property
stores a promise which will be resolved if the resume was
successful, rejected otherwise.

If `SockJS` is defined, it will be used as the socket
transport. Otherwise `WebSocket` will be used. Note that
`SockJS` is required for IE9 support.

#####Arguments

* `host` **string** _required_: the address of the Meteor
  server, e.g. `example.meteor.com`

* `ssl` **boolean** _optional_: whether to use SSL. Defaults
  to `false`.

* `interceptor` **function** _optional_: a function which
  will intercept any socket event. It will be called with an
  event object containing the name of the event, the
  timestamp of the event, and details about the event (for
  instance, in case of a "socket_message_received" event,
  it'll contain the payload of the message).

#####Returns

An Asteroid instance.

------------------------------------------------------------

###Asteroid.on(event, handler)

Registers an event handler for the specified event.

#####Arguments

* `event` **string** _required_: the name of the event.

* `handler` **function** _required_: the handler.

An Asteroid instance emits the following events:

* `connected`: emitted when the DDP connection is
  established. No arguments are passed to the handler.

* `login`: emitted when the user logs in. The id of the
  logged in user will be passed as argument to the handler.

* `logout`: emitted when the user logs out. No arguments are
  passed to the handler.

#####Returns

Nothing

------------------------------------------------------------

###Asteroid.loginWith ... ()

Logs the user in via the specified third party (oauth)
service.

#####Available services

* **facebook**: `loginWithFacebook`

* **google**: `loginWithGoogle`

* **twitter**: `loginWithTwitter`

* **github**: `loginWithGithub`

#####Returns

A promise which will be resolved with the logged user id if
the login is successful. Otherwise it'll be rejected with
the error.

------------------------------------------------------------

###Asteroid.createUser(usernameOrEmail, password, profile)

Creates a user and logs him in. **Does not** hash the
password before sending it to the server. This is not a
problem, since you'll probably be using SSL anyway.

#####Arguments

* `usernameOrEmail` **string** _required_: the username or
  email.

* `password` **string** _required_: the password.

* `profile` **object** _optional_: a blackbox, you can throw
  anything in here and it'll end up into `user.profile`.

#####Returns

A promise which will be resolved with the logged user id if
the creation and login are successful. Otherwise it'll be
rejected with an error.

------------------------------------------------------------

###Asteroid.loginWithPassword(usernameOrEmail, password)

Logs the user in username/email and password. **Does not**
hash the password before sending it to the server. This is
not a problem, since you'll probably be using SSL anyway.

#####Arguments

* `usernameOrEmail` **string** _required_: the username or
  email.

* `password` **string** _required_: the password.

#####Returns

A promise which will be resolved with the logged user id if
the login is successful. Otherwise it'll be rejected with
an error.

------------------------------------------------------------

###Asteroid.logout()

Logs out the user.

#####Arguments

None

#####Returns

A promise which will be resolved with if the logout is
successful. Otherwise it'll be rejected with the error.

------------------------------------------------------------
###Asteroid.subscribe(name, [param1, param2, ...])

Subscribes to the specified subscription. If an identical
subscription (same name and parameters) has already been
made, Asteroid will return that subscription.

#####Arguments

* `name` **string** _required_: the name of the subscription.

* `param1, param2, ...` _optional_: a list of parameters
  that will be passed to the publish function on the server.

#####Returns

A subscription instance.

------------------------------------------------------------

###Asteroid.Subscription

Subscription instances have the following properties:

* `id` **string**: the `id` of the subscription, as
  returned by the `ddp.sub` method

* `ready` **promise**: a promise which will be resolved with
  the `id` of the subscription if the subscription succeeds
  (we receive the ddp `ready` message), or will be rejected
  if it fails (we receive, upon subscribing, the `nosub`
  message).

And the following method:

* `stop`: it takes no argument, sends the ddp `unsub`
  message and deletes the subscription so it can be garbage
  collected.

------------------------------------------------------------

###Asteroid.call(method, [param1, param2, ...])

Calls a server-side method with the specified arguments.

#####Arguments

* `method` **string** _required_: the name of the method to
  call.

* `param1, param2, ...` _optional_: a list of parameters
  that will be passed to the method on the server.

#####Returns

An object with two properties: `result` and `updated`. Both
properties are promises.

If the method is successful, the `result` promise will be
resolved with the return value passed by the server. The
`updated` promise will be resolved with nothing once the
server emits the `updated` message, that tells the client
that any side-effect that the method execution caused on the
database has been reflected on the client (for example, if
the method caused the insertion of an item into a
collection, the client has been notified of said insertion).

If the method fails, the `result` promise will be rejected
with the error returned by the server. The `updated`
promise will be rejected as well (with nothing).

------------------------------------------------------------

###Asteroid.apply(method, params)

Same as Asteroid.call, but using as array of parameters
instead of a list.

#####Arguments

* `method` **string** _required_: the name of the method to
  call.

* `params` **array** _optional_: an array of parameters that
  will be passed to the method on the server.

#####Returns

Same as Asteroid.call, see above.

------------------------------------------------------------

###Asteroid.getCollection(name)

Creates and returns a collection. If the collection already
exists, nothing changes and the existing one is returned.

#####Arguments

* `name` **string** _required_: the name of the collection to
  create.

#####Returns

A reference to the collection.

#####Note

Asteroid auto-creates collections for you. For example, if
you subscribe to an hypothetical `posts` subscription, the
server will start sending the client `added` messages that
refer to items of the `posts` collection. With Meteor's
front-end we would normally need to define the
`posts`collection before we can access it.

With Asteroid, when the first `added` message is received,
if the `posts` collection doesn't exist yet, it will get
automatically created. We can then get a reference to
that collection by calling `createCollection` (or by
accessing the semi-private Asteroid.collections
dictionary).



##Asteroid.Collection methods

All the following methods use latency compensation.



###Collection.insert(item)

Inserts an item into a collection. If the item does not
have an `_id` property, one will be automatically generated
for it.

#####Arguments

* `item` **object** _required_: the object to insert. Must
  be JSON serializable. Optional support for EJSON is
  planned.

#####Returns

An object with two properties: `local` and `remote`. Both
properties are promises.

The local promise is immediately resolved with the `_id` of
the inserted item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which maybe should be fixed).

The remote promise is resolved with the `_id` of the
inserted item if the remote insert is successful. Otherwise
it's rejected with the reason of the failure.

------------------------------------------------------------

###Collection.update(id, item)

Updates the specified item.

#####Arguments

* `id` **string** _required_: the id of the item to update.

* `item` **object** _required_: the object that will
  replace the old one.

#####Returns

An object with two properties: `local` and `remote`. Both
properties are promises.

The local promise is immediately resolved with the `_id` of
the updated item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which should be fixed).

The remote promise is resolved with the `_id` of the updated
item if the remote update is successful. Otherwise it's
rejected with the reason of the failure.

#####Note

<span style="color:red;">The API greatly differs from
Meteor's API. Aligning the two is on the TODO list.</span>

------------------------------------------------------------

###Collection.remove(id)

Removes the specified item.

#####Arguments

* `id` **string** _required_: the id of the item to remove.

#####Returns

An object with two properties: `local` and `remote`. Both
properties are promises.

The local promise is immediately resolved with the `_id` of
the removed item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which should be fixed).

The remote promise is resolved with the `_id` of the removed
item if the remote remove is successful. Otherwise it's
rejected with the reason of the failure.

------------------------------------------------------------

###Collection.reactiveQuery(selector)

Gets a "reactive" subset of the collection.

#####Arguments

* `selector` **object or function** _required_: a
  MongoDB-style selector. Actually for now only a simple
  selector is supported (example `{key1: val1, key2.subkey1:
  val2}`). To compensate for this, you can also pass in a
  filter function which will be invoked on each item of the
  collection. If the function returns a truthy value, the
  item will be included, otherwise it will be left out.
  Help on adding support for more complex selectors is
  appreciated.

#####Returns

A ReactiveQuery instance.



##ReactiveQuery methods and properties



###ReactiveQuery.result

The array of items in the collection that matched the query.

------------------------------------------------------------

###ReactiveQuery.on(event, handler)

Registers a handler for an event.

#####Arguments

* `event` **string** _required_: the name of the event.

* `handler` **function** _required_: the handler for the
  event.

Possible events are:

* `change`: emitted whenever the result of the query
  changes. The id of the item that changed is passed to the
  handler.
