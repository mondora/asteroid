////////////////////////
// Subscription class //
////////////////////////

var Subscription = function (name, params, asteroid) {
	this._name = name;
	this._params = params;
	this._asteroid = asteroid;
	// Subscription promises
	this._ready = Q.defer();
	this.ready = this._ready.promise;
	// Subscribe via DDP
	var or = this._onReady.bind(this);
	var os = this._onStop.bind(this);
	var oe = this._onError.bind(this);
	this.id = asteroid.ddp.sub(name, params, or, os, oe);
};
Subscription.constructor = Subscription;

Subscription.prototype.stop = function () {
	this._asteroid.ddp.unsub(this.id);
};

Subscription.prototype._onReady = function () {
	this._ready.resolve();
};

Subscription.prototype._onStop = function () {
	delete this._asteroid.subscriptions[this.id];
};

Subscription.prototype._onError = function (err) {
	if (this.ready.isPending()) {
		this._ready.reject(err);
	}
	delete this._asteroid.subscriptions[this.id];
};



//////////////////////
// Subscribe method //
//////////////////////

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	// Assert arguments type
	must.beString(name);
	// Collect arguments into array
	var params = Array.prototype.slice.call(arguments, 1);
	var sub = new Subscription(name, params, this);
	this.subscriptions[sub.id] = sub;
	return sub;
};

Asteroid.prototype._reEstablishSubscriptions = function () {
	var subs = this.subscriptions;
	for (var id in subs) {
		subs[id] = new Subscription(subs[id]._name, subs[id]._params, this);
	}
};
