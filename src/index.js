var Asteroid = require("./asteroid.js");

Asteroid.addPlugin(require("./plugins/ddp.js"));
Asteroid.addPlugin(require("./plugins/methods.js"));
Asteroid.addPlugin(require("./plugins/subscriptions.js"));
Asteroid.addPlugin(require("./plugins/password-login.js"));

module.exports = Asteroid;
