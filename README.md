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

##Example

<span style="color:red;">Warning: the API is in flux and needs to be cleaned up. This is what using
Asteroid will look like in a couple of weeks.</span>

```javascript
// Connect to a Meteor backend
var ceres = new Asteroid("localhost:3000");

// Use real-time collection
var tasks = ceres.createCollection("tasks");
ceres.subscribe("tasks");
tasks.insert({
  description: "Do the laundry"
});
var laundryTask = tasks.find({description: "Do the laundry"});

// Login your user
ceres.loginWithTwitter();
```

##Demo

[Demo todo app](mondora.github.io/asteroid)
