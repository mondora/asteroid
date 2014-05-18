#asteroid

An alternative browser client for a Meteor backend.

##Why

I consider Meteor to be an awesome platform, but I find its templating system
not sufficient for building truly amazing web apps. While it is possible
to use it alongside front-end frameworks like AngularJS, the integration is
not painless, and the developer needs to jump through hoops to get what he wants.

By conneting to any Meteor backend via the Distributed Data Protocol, Asteroid
allows the developer to take advantage of the greatest features of Meteor's back-end
platform without having to compromise on the front-end.

[Blog post on the library](http://mondora.com/asteroid-a-better-way-to-build-meteor-apps/)

##Install

First, dowload the library:

    bower install asteroid

Then, add the necessary libraries to your index.html:

    <script src="bower_components/ddp.js/dpp.js"></script>
    <script src="bower_components/q/q.js"></script>
    <script src="bower_components/asteroid/dist/asteroid.js"></script>

##Advantages over the canonical Meteor front-end

* Small footprint. The library is about ~10Kb minified. It depends on ddp.js (~4Kb minified), and a q-compatible promise library (q is ~17Kb minified, for a lightweight alternative, check out my fork of [ayepromise](https://github.com/mondora/ayepromise), which is ~2Kb minified).

* Framework agnostic. Use the tools you already know and love to build your app.

* Allows to use Meteor as a full-blown backend or just as a real-time platform pluggable into any existing project.

* Easily connect to multiple Meteor servers at the same time, perfect for building admin interfaces.

##Test

    npm test

##Example

<span style="color:red;">Warning: the API is in still a bit in flux.</span>

```javascript
// Connect to a Meteor backend
var ceres = new Asteroid("localhost:3000");

// Use real-time collections
ceres.subscribe("tasks");
var tasks = ceres.createCollection("tasks");
tasks.insert({
  description: "Do the laundry"
});
var laundryTaskQuery = tasks.reactiveQuery({description: "Do the laundry"});
console.log(laundryTaskQuery.result); // Logs the array of results

// Login your user
ceres.loginWithTwitter();
```

##Demo

[Example todo app using AngularJS](https://mondora.github.io/meteor-todo)

[Same app using Meteor's front-end client](https://mondora.meteor.com)

The [Asteroid client](http://s27.postimg.org/hc1qjnjsz/Asteroid.png), which includes AngularJS (not required, but included for the demo), is almost half the size of the [Meteor client](http://s29.postimg.org/3mxaifziv/Meteor.png).

##Todo

Here follows a list of things which need to be done before the library
can be considered "production ready":

* allow using selectors and modifiers to update an item (currently you can
  only replace top-level fields in the document with the Collection.update
  method). Difficulty 8/10

* allow using selectors with the reactiveQuery method. Difficulty 8/10

* add EJSON support (by porting Meteor's EJSON package). Difficulty 3/10

* designing a pretty logo. Difficulty 6/10



##API



##Asteroid methods



###new Asteroid(host, ssl, debug)

Creates a new Asteroid instance, that is, a connection to a
Meteor server (via DDP).

After being constructed, the instance will connect itself
to the Meteor backend. It will also try, upon connection,
to resume a previous login session (with a token saved in
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

* `debug`**boolean** _optional_: if set to `true`, DDP messages
  will be logged in the console. Defaults to `false`.

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

WARNING: Meteor 0.8.1 introduced a security policy that breaks
this functionality. [However, work is undergoing to resolve the issue](https://groups.google.com/forum/#!topic/meteor-core/Ma3XTZk4Kqg).
For now, use Meteor < 0.8.1.

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

Creates a user and logs him in. *Does not* use the SRP protocol,
so passwords are sent to the server in plaintext. If you're
using SSL however (and you should), this is not a problem.

#####Arguments

* `usernameOrEmail` **string** _required_: the username or email.

* `password` **string** _required_: the password.

* `profile` **object** _optional_: a blackbox, you can throw anything
  in here and it'll end up into `user.profile`.

#####Returns

A promise which will be resolved with the logged user id if
the creation and login are successful. Otherwise it'll be rejected
with an error.

------------------------------------------------------------

###Asteroid.loginWithPassword(usernameOrEmail, password)

Logs the user in username/email and password. *Does not* use the SRP
protocol, so passwords are sent to the server in plaintext. If you're
using SSL however (and you should), this is not a problem.

#####Arguments

* `usernameOrEmail` **string** _required_: the username or email.

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

Subscribes to the specified subscription. If a subscription
by that name is already present (and successful), first
Asteroid unsubscribes from it.

#####Arguments

* `name` **string** _required_: the name of the subscription.

* `param1, param2, ...` _optional_: a list of parameters
  that will be passed to the publish function on the server.

#####Returns

A promise, this will be resolved with the `id` of the
subscription if the subscription is successful. It will be
rejected otherwise.

------------------------------------------------------------

###Asteroid.unsubscribe(id)

Unsubscribes from the specified subscription.

#####Arguments

* `id` **string** _required_: the `id` of the subscription, as
  returned by the `subscribe` method

#####Returns

Nothing

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

###Asteroid.createCollection(name)

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
automatically created. We can then get a reference to that
collection by calling `createCollection` (or by accessing
the semi-private Asteroid.collections dictionary).



##Asteroid.Collection methods

All the following methods use latency compensation.



###Collection.insert(item)

Inserts an item into a collection. If the item does not
have an _id property, one will be automatically generated
for it.

#####Arguments

* `item` **object** _required_: the object to insert. Must
  be JSON serializable. Optional support for EJSON is
  planned.

#####Returns

An object with two properties: `local` and `remote`. Both
properties are promises.

The local promise is immediately resolved with the _id of
the inserted item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which should be fixed).

The remote promise is resolved with the _id of the inserted
item if the remote insert is successful. Otherwise it's
rejected with the reason of the failure.

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

The local promise is immediately resolved with the _id of
the updated item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which should be fixed).

The remote promise is resolved with the _id of the updated
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

The local promise is immediately resolved with the _id of
the removed item. That is, unless an error occurred. In
that case, an exception will be raised. (TODO: this is a bit
of an API inconsistency which should be fixed).

The remote promise is resolved with the _id of the removed
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
