## 2.0.3 (October 7, 2016)

Fixed a bug on the subscription base mixin when restart the subscription.

## 2.0.2 (February 23, 2016)

Updated ddp.js to `2.1.0`.

## 2.0.1 (February 16, 2016)

No changes. Only published to fix the `latest` tag on npm.

## 2.0.0 (February 16, 2016)

The library has undergone a major rewrite. As such it's drastically different
from `0.6.1`. The API changed, hopefully for the best. Its scope also changed a
bit, so some features that were in `0.6.1` have been dropped in `2.0.0`. Of
course the reverse is also true.

### Most notable changes

* **Installing the library**

  In `0.6.1` the library was distributed as a bundle for client-side
  consumption, and could be installed via bower or npm. It was not possible
  though to `require` via browserify or webpack, `require`-ing it only
  worked in node.

  In `2.0.0` the library is distributed as an npm module. It's not distributed
  as a bundle though, so you can't download it and include it as a script in
  your html. If publishing it as a bundle (through npm and/or bower) is needed,
  please open an issue and I'll add support for it.

  The change was made to support `require`-ing the library in client-side code.
  The bundle is not distributed just because we haven't had the time to do so.

* **Obtaining the `Asteroid` class**

  In `0.6.1` the module exported a class, `Asteroid`.

  In `2.0.0` the module exports a `createClass` function, which is used to
  create the `Asteroid` class.

  The change was made to allow adding functionalities to the class via mixins
  ([see docs](./README.md#mixins)).

  ```js
  // 0.6.1
  const Asteroid = require("asteroid");
  const asteroid = new Asteroid(/* ... */);

  // 2.0.0
  const createClass = require("asteroid").createClass;
  const Asteroid = createClass();
  const asteroid = new Asteroid(/* ... */);
  ```

* **Creating `Asteroid` instances**

  The signature of the `Asteroid` class constructor changed.

  The change was made to allow to specify options which mixins might need.

  ```js
  // 0.6.1
  const asteroid = new Asteroid(host, useSsl, interceptorFunction);

  // 2.0.0
  // The `optionsObject` now takes whatever options needed by the used mixins.
  const asteroid = new Asteroid(optionsObject);
  ```

* **Calling methods**

  In `0.6.1` the `call` and `apply` methods returned an object with two
  properties: `result` and `updated`. `result` was a promise to the method
  invocation result. `updated` was a promise which resolved when the server
  sent an [`updated` message](https://git.io/vgAqA) for the invocation.

  In `2.0.0` both methods return directly a promise to the invocation result.
  The library does not currently offer a way to listen for the updated event (it
  can be done by doing something like
  `asteroidInstance.ddp.on("updated", handler)`).

  The change was made to simplify method calls (it seemed more idiomatic for a
  js library to have this API).

  ```js
  // 0.6.1
  asteroid.call("myMethod", 1, 2, 3).result.then(ret => {
      console.log(ret);
  });

  // 2.0.0
  asteroid.call("myMethod", 1, 2, 3).then(ret => {
      console.log(ret);
  });
  ```

* **Subscribing to publications**

  In `0.6.1` the `subscribe` method returned an object containing:
  - a `stop` method, which could be called to terminate the subscription
  - a `ready` property, a promise which resolved when the server marked the
    subscription as ready

  In `2.0.0` the `subscribe` method returns an object containing:
  - an `id` property, which can be used to terminate the subscription by passing
    it to the `unsubscribe` method
  - an `on` method (the object is an event emitter), which can be used to
    register a handler for the `ready`, `error` (and soon also the `stopped`)
    events

  The change was made to allow a finer-grained management of subscriptions.

* **Managing collections**

  `0.6.1` handled collections.

  `2.0.0` simply doesn't. Handling collections is delegated to third party
  mixins, such as [asteroid-immutable-collections-mixin](https://git.io/vgAz6).

  The change was made because in many projects we found ourselves not using
  Asteroid's collections, but rather re-implementing them in some other way
  (e.g. as immutable maps). To avoid wasting cpu time and memory storing them in
  Asteroid directly, we preferred to leave managing them to external mixins.
  Admittedly, there is currently no mixin that replicates the old behaviour. If
  you developed one or plan to do so, be sure to let us know and we'll list it
  in the [mixins section in the README](./README.md#mixins).

* **Using `reactiveQuery`-s**

  `reactiveQuery`-s were a feature of collections. As such, they have also been
  dropped in `2.0.0`.

## 1.0.0 (February 16, 2016)

**Unless you're certain you need `1.0.0`, skip it and just use `2.0.0`**

### The `1.0.0` fiasco

We began the rewrite that led to `2.0.0` sometime in summer 2015. Development
took place on the `1.0.0-rewrite` branch. Unfortunately we never got to the
point of actually releasing `1.0.0`, and changes staled in the `1.0.0-rewrite`
branch for several months. Some of our projects migrated to `1.0.0`, installing
it directly from the branch.

Then `2.0.0` came along and brought with it some minor braking changes (it's a
bit of an oxymoron, but...) that we couldn't push to `1.0.0-rewrite`. So we
froze the branch, published `1.0.0` from there and right after published
`2.0.0`.

Sorry for the mess. Pretend `1.0.0` never existed. If you can't because - like
us - you're in some way dependent on it, we hope to have made all we can to
keep it available. If not, let us know and we'll help you out.

## 0.7.0 (February 16, 2016)

Basically `0.6.1` with two pull-requests merged in.
