var EventEmitter = require("wolfy87-eventemitter");

var Asteroid = function (options) {
    this._init(options);
};
Asteroid.constructor = Asteroid;
Asteroid.prototype = Object.create(EventEmitter.prototype);

Asteroid.prototype._inits = [];

Asteroid.addPlugin = function addPlugin (plugin) {
    Object.keys(plugin).forEach(function (key) {
        var fn = plugin[key];
        if (key === "init") {
            Asteroid.prototype._inits.push(fn);
        } else {
            Asteroid.prototype[key] = fn;
        }
    });
};

Asteroid.prototype._init = function _init (options) {
    var self = this;
    self._inits.forEach(function (fn) {
        fn.call(self, options);
    });
};

module.exports = Asteroid;
