////////////////////////
// Subscription class //
////////////////////////

var Subscription = function (name, params, hash, asteroid) {
	this._name = name;
	this._params = params;
	this._hash = hash;
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
	delete this._asteroid._subscriptionsCache[this._hash];
};

Subscription.prototype._onReady = function () {
	this._ready.resolve(this.id);
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
	// Hash the arguments to get a key for _subscriptionsCache
	var hash = JSON.stringify(arguments);
	// Only subscribe if there is no cached subscription
	if (!this._subscriptionsCache[hash]) {
		// Collect arguments into array
		var params = Array.prototype.slice.call(arguments, 1);
		var sub = new Subscription(name, params, hash, this);
		this._subscriptionsCache[hash] = sub;
		this.subscriptions[sub.id] = sub;
	}
	return this._subscriptionsCache[hash];
};

Asteroid.prototype._reEstablishSubscriptions = function () {
	var subs = this.subscriptions;
	for (var id in subs) {
		if (subs.hasOwnProperty(id)) {
			subs[id] = new Subscription(subs[id]._name, subs[id]._params, this);
		}
	}
};
