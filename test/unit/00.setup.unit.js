var ENV = typeof window === "undefined" ? "node" : "browser";
if (ENV === "node") {
	global.glb = global;
	global.should = require("should");
	global._ = require("lodash");
	global.Q = require("q");
	global.sinon = require("sinon");
	global.rewire = require("rewire");
	global.Asteroid = rewire("./dist/node.asteroid.js");
} else {
	window.glb = window;
}
