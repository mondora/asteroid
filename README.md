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

##Install

    bower install asteroid

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

The Asteroid client, which includes AngularJS, is almost half the size of the Meteor's client.

Asteroid
<img src="http://s27.postimg.org/hc1qjnjsz/Asteroid.png" alt="Asteroid network inspector" />

Meteor
<img src="http://s29.postimg.org/3mxaifziv/Meteor.png" alt="Meteor network inspector" />
