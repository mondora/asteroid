if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.EventEmitter = function () {};

Asteroid.utils.EventEmitter.prototype = {

	constructor: Asteroid.utils.EventEmitter,

	on: function (name, handler) {
		if (!this._events) this._events = {};
		this._events[name] = this._events[name] || [];
		this._events[name].push(handler);
	},

	off: function (name, handler) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		this._events[name].splice(this._events[name].indexOf(handler), 1);
	},

	_emit: function (name /* , arguments */) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		var args = arguments;
		var self = this;
		this._events[name].forEach(function (handler) {
			handler.apply(self, Array.prototype.slice.call(args, 1));
		});
	}

};
